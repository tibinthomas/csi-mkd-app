#!/bin/bash

# Startup script to install PostgreSQL client tools in Azure Functions
# This script will be executed when the Azure Function App starts

echo "🔧 Installing PostgreSQL client tools..."

# Update package list
apt-get update

# Install PostgreSQL client (includes pg_dump)
apt-get install -y postgresql-client

# Verify installation
if command -v pg_dump &> /dev/null; then
    echo "✅ pg_dump installed successfully"
    pg_dump --version
else
    echo "❌ Failed to install pg_dump"
    exit 1
fi

echo "✅ Startup script completed successfully"
