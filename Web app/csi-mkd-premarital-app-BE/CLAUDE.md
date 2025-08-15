# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Run
```bash
# Restore dependencies  
dotnet restore

# Build project
dotnet build

# Run in development mode
dotnet run

# Run with hot reload for development
dotnet watch run
```

### Database Operations
```bash
# Create new migration
dotnet ef migrations add MigrationName

# Update database with latest migrations
dotnet ef database update

# Remove last migration (if not applied)
dotnet ef migrations remove

# Generate SQL script
dotnet ef migrations script

# Generate compiled models for performance (optional)
dotnet ef dbcontext optimize
```

### Testing & Quality
```bash
# Run tests (if any exist)
dotnet test

# Clean build artifacts
dotnet clean

# Build for production
dotnet build -c Release
```

### Publishing & Deployment
```bash
# Publish for specific runtime
dotnet publish -c Release -r linux-x64 --self-contained true

# Deploy to Azure (requires environment variables)
./deploy.sh
```

## Architecture Overview

This is an ASP.NET Core 9.0 minimal API application for CSI MKD Premarital Counseling registration system. The architecture follows clean separation of concerns with the following key components:

### Core Structure
- **Minimal APIs**: Uses ASP.NET Core minimal APIs organized in `Endpoints/` directory (one file per feature)
- **Configuration Split**: Application configuration is modularized in `Configuration/` directory:
  - `ServiceConfiguration.cs`: Service registrations, DI, caching, JWT auth
  - `MiddlewareConfiguration.cs`: Middleware pipeline setup
  - `EndpointConfiguration.cs`: Route mapping
  - `StartupConfiguration.cs`: Application warmup tasks

### Data Layer
- **Entity Framework Core**: PostgreSQL database with Npgsql provider
- **Models**: Domain entities in `models/` directory
- **DbContext**: Located at `data/applicationDbContext.cs`
- **Repositories**: Data access layer in `Repositories/`
- **Migrations**: Database migrations in `Migrations/`

### Business Logic
- **Services**: Business logic in `Services/` directory with interface-based design
- **DTOs**: Data transfer objects in `DTOs/` directory
- **Endpoints**: Feature-based endpoint grouping in `Endpoints/`

### Key Features
- **Registration Types**: Premarital, General, and Confirmation registrations
- **Session Management**: Configurable counseling sessions
- **File Uploads**: Azure Blob Storage integration for document handling
- **Caching**: Comprehensive output caching and memory caching with invalidation system
- **Email Integration**: SendGrid for automated notifications
- **Authentication**: JWT-based admin authentication
- **Rate Limiting**: AspNetCoreRateLimit for API protection
- **reCAPTCHA**: Google reCAPTCHA integration for form protection

### Cache System
The application implements a sophisticated cache invalidation system:
- **Output Caching**: API response caching with tags (`premarital-regs`, `general-regs`, etc.)
- **Memory Caching**: Internal service data caching (email config, sessions)
- **Automatic Invalidation**: Caches are invalidated on data changes
- **Manual Management**: Admin endpoints for cache control at `/api/cache/*`
- **Health Monitoring**: Background service monitors cache health

### External Integrations
- **Azure Blob Storage**: Document and file storage
- **SendGrid**: Email delivery service
- **Google reCAPTCHA**: Bot protection
- **PostgreSQL**: Primary database on Supabase

### Development Environment
- **Hot Reload**: Use `dotnet watch run` for development
- **Swagger**: API documentation available at `/swagger` in development
- **Aspire**: Service defaults for telemetry and health checks

### Deployment
- **Containerized**: Docker support with multi-stage builds
- **Azure Container Apps**: Production deployment target
- **Environment Variables**: Secrets managed via environment variables or `.env` file
- **Automated Deployment**: `deploy.sh` script handles full CI/CD pipeline

### Database Schema
Key entities include:
- `PremaritalRegistration`: Main registration entity with session foreign key
- `SessionConfiguration`: Counseling session configurations
- `AdminUser`: Admin authentication
- `ClassFeedback`: Session feedback from participants
- `EmailConfig`: Email template configuration
- Document entities for file management per registration type

### Security Features
- JWT authentication for admin endpoints
- Rate limiting (2 req/sec, 50 req/15min for general; 10 req/sec, 200 req/15min for clients)
- reCAPTCHA validation on public forms
- CORS configuration
- Input validation and sanitization
- Audit trail for data changes

### Performance Optimizations
- Output caching with intelligent invalidation
- Entity Framework compiled models in production
- Single-file deployment with ReadyToRun
- Connection pooling and query optimization
- Background cache health monitoring