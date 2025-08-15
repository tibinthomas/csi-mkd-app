#!/bin/bash

# Azure Function Deployment Script for Sessions API
# Usage: ./deploy.sh [environment] [env-file]

set -e

# Load environment variables from .env.deployment file
ENV_FILE=${2:-.env.deployment}
ENVIRONMENT=${1:-production}

if [ -f "$ENV_FILE" ]; then
    echo "📄 Loading environment variables from $ENV_FILE"
    set -a  # automatically export all variables
    source "$ENV_FILE"
    set +a  # stop automatically exporting
    echo "✅ Environment variables loaded"
else
    echo "⚠️  Environment file $ENV_FILE not found, using defaults"
fi

# Validate required environment variables
if [ -z "$RESOURCE_GROUP" ]; then
    echo "❌ RESOURCE_GROUP not set in environment file"
    exit 1
fi

if [ -z "$FUNCTION_APP_NAME" ]; then
    echo "❌ FUNCTION_APP_NAME not set in environment file"
    exit 1
fi

if [ -z "$LOCATION" ]; then
    echo "❌ LOCATION not set in environment file"
    exit 1
fi

# Configuration from environment variables
STORAGE_ACCOUNT="${FUNCTION_APP_NAME}storage"
RUNTIME="dotnet-isolated"
RUNTIME_VERSION="8"

echo "🚀 Starting Azure Function deployment..."
echo "Environment: $ENVIRONMENT"
echo "Resource Group: $RESOURCE_GROUP"
echo "Function App: $FUNCTION_APP_NAME"
echo "Location: $LOCATION"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    echo "   Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

echo "✅ Azure CLI check passed"

# Create resource group if it doesn't exist
echo "📦 Creating resource group if needed..."
az group create --name $RESOURCE_GROUP --location "$LOCATION" --output none
echo "✅ Resource group ready: $RESOURCE_GROUP"

# Create storage account if it doesn't exist
echo "💾 Creating storage account if needed..."
az storage account create \
    --name $STORAGE_ACCOUNT \
    --location "$LOCATION" \
    --resource-group $RESOURCE_GROUP \
    --sku Standard_LRS \
    --kind StorageV2 \
    --output none || echo "Storage account already exists"
echo "✅ Storage account ready: $STORAGE_ACCOUNT"

# Create Function App if it doesn't exist
echo "⚡ Creating Function App if needed..."
az functionapp create \
    --resource-group $RESOURCE_GROUP \
    --consumption-plan-location "$LOCATION" \
    --runtime $RUNTIME \
    --runtime-version $RUNTIME_VERSION \
    --functions-version 4 \
    --name $FUNCTION_APP_NAME \
    --storage-account $STORAGE_ACCOUNT \
    --os-type Linux \
    --output none || echo "Function App already exists"
echo "✅ Function App ready: $FUNCTION_APP_NAME"

# Set application settings
echo "⚙️  Configuring application settings..."

# Configure connection string
if [ ! -z "$DB_CONNECTION_STRING" ]; then
    az functionapp config appsettings set \
        --name $FUNCTION_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --settings "ConnectionStrings__DefaultConnection=$DB_CONNECTION_STRING" \
        --output none
    echo "✅ Database connection string configured"
else
    echo "⚠️  DB_CONNECTION_STRING not found in environment file"
    echo "   Please set it in $ENV_FILE"
fi

# Configure Application Insights if needed
if [ ! -z "$APPINSIGHTS_CONNECTION_STRING" ]; then
    az functionapp config appsettings set \
        --name $FUNCTION_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --settings "APPLICATIONINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONNECTION_STRING" \
        --output none
    echo "✅ Application Insights configured"
fi

# Enable CORS for multiple URLs
echo "🌐 Configuring CORS..."

# Configure CORS for frontend URLs
if [ ! -z "$FRONTEND_URLS" ]; then
    for url in $FRONTEND_URLS; do
        az functionapp cors add \
            --name $FUNCTION_APP_NAME \
            --resource-group $RESOURCE_GROUP \
            --allowed-origins $url \
            --output none || echo "CORS for $url already configured"
        echo "✅ CORS configured for: $url"
    done
else
    echo "⚠️  FRONTEND_URLS not set, using default"
fi

# Configure CORS for main API if needed
if [ ! -z "$MAIN_API_URL" ]; then
    az functionapp cors add \
        --name $FUNCTION_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --allowed-origins $MAIN_API_URL \
        --output none || echo "CORS for main API already configured"
    echo "✅ CORS configured for main API: $MAIN_API_URL"
fi

# Build and publish the function
echo "🔨 Building and publishing function..."
dotnet publish --configuration Release --output ./publish

# Deploy to Azure
echo "📤 Deploying to Azure..."
az functionapp deployment source config-zip \
    --name $FUNCTION_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --src ./publish.zip || {
    
    # Create zip file if it doesn't exist
    echo "📦 Creating deployment package..."
    cd publish
    zip -r ../publish.zip . -q
    cd ..
    
    # Try deployment again
    az functionapp deployment source config-zip \
        --name $FUNCTION_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --src ./publish.zip
}

# Clean up
rm -rf ./publish
rm -f ./publish.zip

# Get the function URL
FUNCTION_URL=$(az functionapp show --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" --output tsv)
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📍 Function App URL: https://$FUNCTION_URL"
echo "🔗 API Endpoints:"
echo "   GET https://$FUNCTION_URL/api/sessions"
echo "   GET https://$FUNCTION_URL/api/sessions/{year}"
echo ""
echo "🛠️  Management:"
echo "   Portal: https://portal.azure.com/#resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/sites/$FUNCTION_APP_NAME"
echo "   Logs: az functionapp logs tail --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "⚠️  Next steps:"
echo "   1. Update your main API to use the new function URLs"
echo "   2. Test the endpoints"
echo "   3. Monitor logs for any issues"