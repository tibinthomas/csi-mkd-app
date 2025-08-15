#!/bin/bash

# Start Azure Function for testing
echo "⚡ Starting Sessions Azure Function..."

# Check if Azure Functions Core Tools is installed
if ! command -v func &> /dev/null; then
    echo "❌ Azure Functions Core Tools not found"
    echo "   Install with: npm install -g azure-functions-core-tools@4 --unsafe-perm true"
    exit 1
fi

# Check if port is in use
if lsof -i :7071 &> /dev/null; then
    echo "⚠️  Port 7071 is in use. Killing existing process..."
    pkill -f "func" || true
    sleep 2
fi

# Clean and build the function
echo "🔨 Cleaning and building function..."
dotnet clean
dotnet restore
dotnet build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"
echo ""
echo "🚀 Starting function on http://localhost:7071"
echo ""
echo "📍 Available endpoints:"
echo "   📊 All sessions:     http://localhost:7071/api/sessions"
echo "   📅 Sessions by year: http://localhost:7071/api/sessions/2025"
echo "   📚 Swagger UI:       http://localhost:7071/api/swagger/ui"
echo "   📄 OpenAPI spec:     http://localhost:7071/api/swagger.json"
echo ""

# Start the function
func start