# CSI MKD Premarital Counseling Backend

This project uses ASP.NET Core minimal APIs for faster cold start and simpler routing. Endpoints are organized per feature under `Endpoints/`.

## 🚀 Quick Start

### Prerequisites

- .NET 9.0 SDK
- Docker (for containerized builds)
- Git

### Development Workflow

#### 1. Build and Run

```bash
# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run in development mode
dotnet run
```

#### 2. Model Compilation and Database

```bash
# Create a new migration
dotnet ef migrations add MigrationName

# Update database with latest migrations
dotnet ef database update

# Generate SQL script (optional)
dotnet ef migrations script
```

#### 3. Build for Production

```bash
# Build optimized release version
dotnet build -c Release

# Publish for specific runtime
dotnet publish -c Release -r linux-x64 --self-contained true

# Publish for Docker
dotnet publish -c Release -o ./app/publish
```

#### 4. Docker Build

```bash
# Build Docker image
docker build -t csi-mkd-premarital-app .

# Run container
docker run -p 8080:8080 csi-mkd-premarital-app
```

#### 5. Commit and Deploy

```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add new feature description"

# Push to remote
git push origin main

# Deploy (uses deploy.sh script)
./deploy.sh
```

## 📁 Key Folders

- `Endpoints/`: Minimal API endpoint mappings (one file per feature)
- `Services/`, `Repositories/`, `Models/`, `DTOs/`: Domain layers unchanged
- `Migrations/`: Entity Framework database migrations
- `Configuration/`: Application configuration and startup

## 🔧 Development Commands

### Database Operations

```bash
# Add new migration
dotnet ef migrations add [MigrationName]

# Remove last migration
dotnet ef migrations remove

# Update database
dotnet ef database update

# Generate SQL script
dotnet ef migrations script

# Generate compiled models for performance
dotnet ef dbcontext optimize
```

### Build Commands

```bash
# Clean build artifacts
dotnet clean

# Restore packages
dotnet restore

# Build project
dotnet build

# Run tests (if any)
dotnet test

# Run with watch mode
dotnet watch run
```

### Publishing

```bash
# Publish for Linux
dotnet publish -c Release -r linux-x64 --self-contained true

# Publish for Windows
dotnet publish -c Release -r win-x64 --self-contained true

# Publish for macOS
dotnet publish -c Release -r osx-arm64 --self-contained true
```

## 🌐 API Documentation

Swagger UI is enabled in Development at `/swagger`.

## 🚀 Deployment

Use the `deploy.sh` script for automated deployment to Azure Container Apps:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 📝 Development Tips

1. **Always run `dotnet restore` after pulling changes**
2. **Use meaningful migration names**: `dotnet ef migrations add AddUserProfileTable`
3. **Test migrations locally before committing**
4. **Use `dotnet watch run` for development with auto-reload**
5. **Check build output with `dotnet build --verbosity normal`**
