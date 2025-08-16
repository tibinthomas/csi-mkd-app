#!/bin/bash
set -e
set -o pipefail

# -----------------------
# Deploy Both Applications
# Calls individual deployment scripts for Main API and Sessions Function
# -----------------------

echo "🚀 Deploying both Main API and Sessions Function..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check that both deployment scripts exist
if [ ! -f "$SCRIPT_DIR/deploy-main-api.sh" ]; then
    echo "❌ deploy-main-api.sh not found in $SCRIPT_DIR"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/deploy-sessions-function.sh" ]; then
    echo "❌ deploy-sessions-function.sh not found in $SCRIPT_DIR"
    exit 1
fi

# Make sure both scripts are executable
chmod +x "$SCRIPT_DIR/deploy-main-api.sh"
chmod +x "$SCRIPT_DIR/deploy-sessions-function.sh"

# -----------------------
# DEPLOY MAIN API
# -----------------------
echo "📱 Starting Main API deployment..."
echo "=================================================="
"$SCRIPT_DIR/deploy-main-api.sh" || {
    echo "❌ Main API deployment failed!"
    exit 1
}

echo ""
echo "✅ Main API deployment completed!"
echo ""

# -----------------------
# DEPLOY SESSIONS FUNCTION
# -----------------------
echo "⚡ Starting Sessions Function deployment..."
echo "=================================================="
"$SCRIPT_DIR/deploy-sessions-function.sh" || {
    echo "❌ Sessions Function deployment failed!"
    exit 1
}

echo ""
echo "✅ Sessions Function deployment completed!"
echo ""

# -----------------------
# FINAL SUMMARY
# -----------------------
echo "🎉 Both applications deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "   • Check both services are running in Azure Portal"
echo "   • Test Main API Swagger endpoint"
echo "   • Test Sessions Function endpoints"
echo "   • Monitor logs for any issues"
echo ""
echo "🔧 Individual deployment commands:"
echo "   Main API only:        ./deploy-main-api.sh"
echo "   Sessions Function:    ./deploy-sessions-function.sh"