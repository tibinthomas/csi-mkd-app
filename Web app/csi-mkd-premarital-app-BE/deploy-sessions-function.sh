#!/bin/bash
set -e
set -o pipefail

# -----------------------
# Deploy Sessions Function to Azure Functions
# -----------------------

echo "⚡ Deploying Sessions Function to Azure Functions..."

# -----------------------
# CONFIG - Update with your Function App name
# -----------------------
FUNCTION_APP_NAME="csi-mkd-counselling-be"
RESOURCE_GROUP="csi-mkd-premarital-counsel-app"

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
    "ConnectionStrings__DefaultConnection"
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
for cmd in func az dotnet; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "❌ Required command '$cmd' not found."
        if [ "$cmd" = "func" ]; then
            echo "📥 Install Azure Functions Core Tools: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local"
        fi
        exit 1
    fi
done

# -----------------------
# AZURE LOGIN
# -----------------------
if ! az account show &>/dev/null; then
    echo "🔑 Logging into Azure..."
    az login || { echo "❌ Azure login failed."; exit 1; }
fi

# -----------------------
# BUILD & DEPLOY FUNCTION
# -----------------------
echo "🏗️ Building Sessions Function..."
cd SessionsFunction

# Restore and build
dotnet restore
dotnet build -c Release

echo "🚀 Deploying to Azure Function: $FUNCTION_APP_NAME"
func azure functionapp publish "$FUNCTION_APP_NAME" --dotnet-isolated || {
    echo "❌ Function deployment failed."
    exit 1
}

cd ..

# -----------------------
# UPDATE FUNCTION APP SETTINGS
# -----------------------
echo "🔧 Updating Function App settings..."
az functionapp config appsettings set \
    --name "$FUNCTION_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --settings \
        "ConnectionStrings__DefaultConnection=$ConnectionStrings__DefaultConnection" \
        "FUNCTIONS_WORKER_RUNTIME=dotnet-isolated" \
        "FUNCTIONS_EXTENSION_VERSION=~4" || {
    echo "⚠️ Warning: Failed to update some settings, but deployment may still work."
}

# -----------------------
# GET DEPLOYMENT URL
# -----------------------
FUNCTION_APP_URL=$(az functionapp show --name "$FUNCTION_APP_NAME" --resource-group "$RESOURCE_GROUP" --query "defaultHostName" -o tsv)

echo ""
echo "✅ Sessions Function deployment successful!"
echo ""
echo "📋 Service URL:"
echo "   Sessions Function: https://$FUNCTION_APP_URL"
echo "   Function API:      https://$FUNCTION_APP_URL/api"
echo ""
echo "🔧 Management:"
echo "   Azure Portal:      https://portal.azure.com"
echo "   Resource Group:    $RESOURCE_GROUP"
echo "   Function App:      $FUNCTION_APP_NAME"
echo ""
echo "📊 Monitor logs:"
echo "   func azure functionapp logstream $FUNCTION_APP_NAME"