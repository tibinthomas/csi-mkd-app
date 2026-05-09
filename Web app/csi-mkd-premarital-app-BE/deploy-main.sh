#!/bin/bash
set -e
set -o pipefail

# -----------------------
# Deploy Main API to Azure Container App
# -----------------------

echo "🚀 Deploying Main API to Azure Container App..."

# -----------------------
# CONFIG
# -----------------------
DOCKER_USER="tibinthomas"
IMAGE_NAME="tibinthomas/csi-mkd-counselling-web-api"
RESOURCE_GROUP="csi-mkd-premarital-counsel-app"
CONTAINER_APP_NAME="csi-mid-counselling-web-api"

# Multi-arch support
PLATFORMS="linux/amd64,linux/arm64"

VERSION="v1.0.0"

# Dynamic config
GIT_HASH="$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M)"
IMAGE_TAG="$VERSION-$GIT_HASH"
FULL_IMAGE="$IMAGE_NAME:$IMAGE_TAG"

# -----------------------
# LOAD & VALIDATE SECRETS
# -----------------------
if [ -f .env ]; then
    echo "📜 Loading environment variables from .env file..."

    set -o allexport
    source .env
    set +o allexport
fi

required_secrets=(
    "DOCKER_PAT"
    "ConnectionStrings__DefaultConnection"
    "ConnectionStrings__CosmosConnection"
    "CosmosDb__DatabaseName"
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
    printf "  - %s\n" "${missing_secrets[@]}"
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

# -----------------------
# ENABLE BUILDX
# -----------------------
echo "🔧 Initializing Docker buildx..."

docker buildx create --use --name multiarch-builder 2>/dev/null || true
docker buildx inspect --bootstrap

# -----------------------
# DOCKER LOGIN & BUILD
# -----------------------
echo "🔑 Logging into Docker Hub with PAT..."

echo "$DOCKER_PAT" | docker login \
    -u "$DOCKER_USER" \
    --password-stdin

echo "📦 Building and pushing multi-arch image:"
echo "   $FULL_IMAGE"

docker buildx build \
    --platform "$PLATFORMS" \
    -t "$FULL_IMAGE" \
    --push \
    . || {
        echo "❌ Build & push failed."
        exit 1
    }

echo "✅ Image pushed successfully."

# -----------------------
# VERIFY IMAGE MANIFEST
# -----------------------
echo "🔍 Verifying image architectures..."

docker manifest inspect "$FULL_IMAGE"

# -----------------------
# AZURE LOGIN
# -----------------------
if ! az account show &>/dev/null; then
    echo "🔑 Logging into Azure..."

    az login || {
        echo "❌ Azure login failed."
        exit 1
    }
fi

# -----------------------
# UPDATE CONTAINER APP
# -----------------------
echo "🚀 Updating Azure Container App: $CONTAINER_APP_NAME"

az containerapp update \
    --name "$CONTAINER_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$FULL_IMAGE" \
    --set-env-vars \
        ASPNETCORE_URLS="http://+:8080" \
        DOTNET_RUNNING_IN_CONTAINER=true \
        ConnectionStrings__DefaultConnection="${ConnectionStrings__DefaultConnection}" \
        ConnectionStrings__CosmosConnection="${ConnectionStrings__CosmosConnection}" \
        CosmosDb__DatabaseName="${CosmosDb__DatabaseName}" \
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

# -----------------------
# GET DEPLOYMENT URL
# -----------------------
CONTAINER_APP_URL=$(
    az containerapp show \
        --name "$CONTAINER_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query "properties.configuration.ingress.fqdn" \
        -o tsv
)

echo ""
echo "✅ Main API deployment successful!"
echo ""
echo "📋 Service URL:"
echo "   Main API:         https://$CONTAINER_APP_URL"
echo "   Main API Swagger: https://$CONTAINER_APP_URL/swagger"
echo ""
echo "🔧 Management:"
echo "   Azure Portal:     https://portal.azure.com"
echo "   Resource Group:   $RESOURCE_GROUP"
echo "   Container App:    $CONTAINER_APP_NAME"
echo ""
echo "✅ Supported Architectures:"
echo "   - linux/amd64"
echo "   - linux/arm64"