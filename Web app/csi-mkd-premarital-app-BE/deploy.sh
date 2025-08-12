#!/bin/bash
set -e
set -o pipefail

# -----------------------
# CONFIG
# -----------------------
# Static config
DOCKER_USER="tibinthomas"
IMAGE_NAME="tibinthomas/csi-mkd-counselling-web-api"
RESOURCE_GROUP="csi-mkd-premarital-counsel-app"
APP_NAME="csi-mid-counselling-web-api"
PLATFORM="linux/amd64"
RUNTIME_IDENTIFIER="linux-x64"

# Dynamic config
IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M)"
FULL_IMAGE="$IMAGE_NAME:$IMAGE_TAG"

# -----------------------
# LOAD & VALIDATE SECRETS
# -----------------------
# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "📜 Loading environment variables from .env file..."
    set -o allexport
    source .env
    set +o allexport
fi

# Validate that required secrets are set
required_secrets=(
    "DOCKER_PAT"
    "ConnectionStrings__DefaultConnection"
    "JwtSettings__Key"
    "JwtSettings__Issuer"
    "JwtSettings__Audience"
    "SendGrid__ApiKey"
    "AzureBlob__ConnectionString"
    "AzureBlob__AccountName"
    "AzureBlob__AccountKey"
    "GoogleReCaptcha__SecretKey"
)

missing_secrets=()
for secret in "${required_secrets[@]}"; do
    if [ -z "${!secret}" ]; then
        missing_secrets+=("$secret")
    fi
done

if [ ${#missing_secrets[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for secret in "${missing_secrets[@]}"; do
        echo "  - $secret"
    done
    echo "👉 Please set them in your environment or in a .env file."
    exit 1
fi

echo "✅ All required secrets are present."

# -----------------------
# CHECK TOOLS
# -----------------------
for cmd in docker az; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "❌ Required command '$cmd' not found."
        exit 1
    fi
done

if ! docker buildx version &>/dev/null; then
    echo "⚠️ Docker Buildx not found. Creating builder..."
    docker buildx create --use
fi

# -----------------------
# DOCKER LOGIN (PAT)
# -----------------------
echo "🔑 Logging into Docker Hub with PAT..."
echo "$DOCKER_PAT" | docker login -u "$DOCKER_USER" --password-stdin || {
    echo "❌ Docker login failed."
    exit 1
}

# -----------------------
# BUILD & PUSH
# -----------------------
echo "📦 Building and pushing $FULL_IMAGE for $PLATFORM (RID: $RUNTIME_IDENTIFIER)..."
docker buildx build \
    --platform "$PLATFORM" \
    --build-arg RUNTIME_IDENTIFIER="$RUNTIME_IDENTIFIER" \
    -t "$FULL_IMAGE" \
    --push \
    . || { echo "❌ Build & push failed."; exit 1; }

echo "✅ Image pushed: $FULL_IMAGE"

# -----------------------
# AZURE LOGIN
# -----------------------
if ! az account show &>/dev/null; then
    echo "🔑 Logging into Azure..."
    az login || { echo "❌ Azure login failed."; exit 1; }
fi

# -----------------------
# SET REGISTRY CREDS IN AZURE
# -----------------------
echo "🔧 Setting Azure Container App registry credentials..."
az containerapp registry set \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --server docker.io \
    --username "$DOCKER_USER" \
    --password "$DOCKER_PAT" || {
        echo "❌ Failed to set registry credentials in Azure."
        exit 1
    }

# -----------------------
# UPDATE AZURE CONTAINER APP
# -----------------------
echo "🚀 Updating Azure Container App with new image..."
az containerapp update \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$FULL_IMAGE" \
    --set-env-vars \
        ASPNETCORE_URLS="http://+:8080" \
        OTEL_SERVICE_NAME="csi-mkd-premarital-app-BE" \
        ConnectionStrings__DefaultConnection="${ConnectionStrings__DefaultConnection}" \
        JwtSettings__Key="${JwtSettings__Key}" \
        JwtSettings__Issuer="${JwtSettings__Issuer}" \
        JwtSettings__Audience="${JwtSettings__Audience}" \
        SendGrid__ApiKey="${SendGrid__ApiKey}" \
        AzureBlob__ConnectionString="${AzureBlob__ConnectionString}" \
        AzureBlob__AccountName="${AzureBlob__AccountName}" \
        AzureBlob__AccountKey="${AzureBlob__AccountKey}" \
        GoogleReCaptcha__SecretKey="${GoogleReCaptcha__SecretKey}" || {
        echo "❌ Azure Container App update failed."
        exit 1
    }

echo "✅ Deployment successful: $FULL_IMAGE is live!"