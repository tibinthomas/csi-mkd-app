#!/bin/bash
set -e
set -o pipefail

# -----------------------
# CONFIG
# -----------------------
DOCKER_USER="tibinthomas"
DOCKER_PAT="REDACTED_DOCKER_PAT"
IMAGE_NAME="tibinthomas/csi-mkd-counselling-web-api"
# Aspire orchestrates multi-project; tag by git sha or timestamp for traceability
IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M)"
RESOURCE_GROUP="csi-mkd-premarital-counsel-app"
APP_NAME="csi-mid-counselling-web-api"
# Use linux/amd64 or linux/arm64 as needed
PLATFORM="linux/amd64"

# Runtime identifier to match the container base; keep in sync with Dockerfile ARG
RUNTIME_IDENTIFIER="linux-x64"

FULL_IMAGE="$IMAGE_NAME:$IMAGE_TAG"

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
# SET REGISTRY CREDS IN AZURE (only needed once)
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
