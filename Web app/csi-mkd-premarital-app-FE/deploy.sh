#!/bin/bash
set -e
set -o pipefail

# -----------------------
# CONFIG
# -----------------------
APP_NAME="csi-mkd-premarital-app-fe"
BUILD_CONFIG="production"
DIST_DIR="dist/csi-mkd-counselling/browser"
INDEX_SOURCE="$DIST_DIR/ml/index.html"
INDEX_TARGET="$DIST_DIR/index.html"
SWA_ENV="production"
SWA_TOKEN="038de867bb60301592aaa7e8d1868afb13f76b16558515cd89fcb2b967ad3d9002-cfd897b8-72dc-445c-b406-b78647f9d55901e18170a242d21e"

# -----------------------
# CHECK TOOLS
# -----------------------
for cmd in npm ng swa; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "❌ Required command '$cmd' not found."
        exit 1
    fi
done

# -----------------------
# VERSION BUMP
# -----------------------
echo "🔄 Bumping npm patch version..."
npm version patch --force || {
    echo "❌ Failed to bump npm version."
    exit 1
}

# -----------------------
# BUILD
# -----------------------
echo "🏗 Building Angular app with config: $BUILD_CONFIG..."
ng build --configuration "$BUILD_CONFIG" || {
    echo "❌ Angular build failed."
    exit 1
}

# -----------------------
# COPY INDEX.HTML
# -----------------------
if [ ! -f "$INDEX_SOURCE" ]; then
    echo "❌ Missing source index.html at: $INDEX_SOURCE"
    exit 1
fi

echo "📄 Copying $INDEX_SOURCE → $INDEX_TARGET..."
cp "$INDEX_SOURCE" "$INDEX_TARGET" || {
    echo "❌ Failed to copy index.html."
    exit 1
}

# -----------------------
# DEPLOY TO SWA
# -----------------------
if [ -z "$SWA_TOKEN" ]; then
    echo "❌ SWA deployment token is missing."
    exit 1
fi

if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Build output directory not found: $DIST_DIR"
    exit 1
fi

echo "🚀 Deploying to Azure Static Web Apps..."
swa deploy "$DIST_DIR" \
    --app-name "$APP_NAME" \
    --env "$SWA_ENV" \
    --deployment-token "$SWA_TOKEN" || {
        echo "❌ SWA deployment failed."
        exit 1
    }

echo "✅ Deployment completed successfully!"
