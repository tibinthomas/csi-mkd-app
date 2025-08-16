# CLAUDE.md

# Project Coding Standards (Microsoft Guidelines Based)

This project follows **Microsoft’s official coding conventions** and **best practices** for .NET Core, C#, ASP.NET Core, and Entity Framework Core.  
All AI agents must follow these rules when generating or reviewing code.

---

## 1. General Coding Style (C# Conventions)

- **Naming**
  - Classes, methods, properties: **PascalCase**
  - Private fields: **\_camelCase** (underscore prefix)
  - Parameters and local variables: **camelCase**
  - Interfaces: start with **I** (e.g., `IService`)
  - Constants: **PascalCase**
- **Layout**
  - One class per file
  - Place **braces on new line** for classes and methods
  - Indentation: 4 spaces, no tabs
  - Keep files under ~400 lines
- **Language Usage**
  - Use `var` for local variables when the type is obvious
  - Use string interpolation (`$"..."`) instead of concatenation
  - Avoid `dynamic` unless required
  - Prefer `async/await` instead of `.Result` or `.Wait()`

---

## 2. Error Handling

- Never swallow exceptions silently
- Use specific exceptions (not just `Exception`)
- Use `try/catch` at boundaries (e.g., controllers, background jobs)
- Use `throw;` to rethrow, not `throw ex;`
- Log exceptions with `ILogger<T>`

---

## 3. ASP.NET Core Best Practices

- Use **Dependency Injection** for all services
- Register services with appropriate lifetime:
  - `AddSingleton` for single instance
  - `AddScoped` for per-request
  - `AddTransient` for short-lived
- Avoid static classes for business logic
- Keep controllers thin:
  - Validation → Model validation attributes
  - Business logic → Services
  - Data access → Repositories/DbContext
- Use minimal APIs or controllers, but not a mix in the same service
- Use configuration via `IOptions<T>`

---

## 4. EF Core Best Practices

- Use **Migrations** for schema changes (not `EnsureCreated` in production)
- Use `AsNoTracking()` for read-only queries
- Prefer `Include` over lazy loading (disable lazy loading by default)
- Batch queries where possible
- Avoid `ToList()` until necessary
- Use async versions of EF methods (`ToListAsync`, `SaveChangesAsync`)
- Keep `DbContext` lifetime **scoped**
- Use value conversions or enums for domain values

---

## 5. API Design Guidelines

- Follow **RESTful conventions**
  - Nouns for resource names (`/api/users`)
  - Use plural naming (`/api/orders`)
  - Return proper HTTP status codes (`200 OK`, `400 BadRequest`, `404 NotFound`, `500 InternalServerError`)
- Use DTOs / ViewModels for API responses (avoid exposing EF entities directly)
- Always validate input (ModelState / FluentValidation)
- Paginate large lists (`GET /api/users?page=1&pageSize=20`)
- Apply authentication/authorization consistently with policies

---

## 6. Performance & Security

- Cache expensive queries or external API calls
- Use `IAsyncEnumerable<T>` for streaming where appropriate
- Avoid synchronous I/O in async code
- Use parameterized queries (EF Core handles this by default)
- Store secrets in **Azure Key Vault / Secret Manager**, never in code
- Use HTTPS and enforce secure cookies
- Apply proper CORS rules (least privilege)

---

## 7. Testing Guidelines

- Unit test business logic
- Integration test repositories and APIs
- Use in-memory DB (or SQLite in memory) for EF Core tests
- Mock external dependencies
- Follow AAA pattern (Arrange, Act, Assert)

---

## 8. Code Analysis & Tooling

- Enforce rules via **Roslyn Analyzers**
- Follow `.editorconfig` with Microsoft defaults
- Run `dotnet format` for consistent style
- Treat warnings as errors in CI (`<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`)

---

## 9. AI Agent Instructions

- Always **consult these guidelines before generating code**
- If user requests violate best practices, suggest a compliant alternative
- Apply:
  - C# conventions
  - EF Core performance rules
  - ASP.NET Core dependency injection patterns
  - Microsoft REST API guidelines
- Prefer modern patterns (e.g., **minimal APIs**, **record types**, **nullable reference types**)
- Never use obsolete .NET Framework APIs

---

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
# PostgreSQL (Primary Database)
dotnet ef migrations add MigrationName
dotnet ef database update
dotnet ef migrations remove
dotnet ef migrations script
dotnet ef dbcontext optimize

# Cosmos DB (NoSQL Database)
dotnet ef database ensure-created --context CosmosDbContext
dotnet ef migrations add MigrationName --context CosmosDbContext
dotnet ef database update --context CosmosDbContext
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

- **Entity Framework Core**: Dual database support
  - **PostgreSQL**: Primary relational database with Npgsql provider
  - **Azure Cosmos DB**: NoSQL database for analytics and flexible data
- **Models**: Domain entities in `models/` directory
- **DbContexts**:
  - `data/applicationDbContext.cs` - PostgreSQL context
  - `data/CosmosDbContext.cs` - Cosmos DB context
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
- **PostgreSQL**: Primary relational database on Supabase
- **Azure Cosmos DB**: NoSQL database for analytics and flexible document storage

### Development Environment

- **Hot Reload**: Use `dotnet watch run` for development
- **Swagger**: API documentation available at `/swagger` in development
- **Aspire**: Service defaults for telemetry and health checks

### Deployment

- **Containerized**: Docker support with multi-stage builds
- **Azure Container Apps**: Production deployment target
- **Environment Variables**: Secrets managed via environment variables or `.env` file
  - Requires both PostgreSQL and Cosmos DB connection strings
  - Configure `CosmosDb__DatabaseName` for target database
- **Automated Deployment**: `deploy.sh` script handles full CI/CD pipeline

### Database Schema

#### PostgreSQL (Primary Database)

Key entities include:

- `PremaritalRegistration`: Main registration entity with session foreign key
- `SessionConfiguration`: Counseling session configurations
- `AdminUser`: Admin authentication
- `ClassFeedback`: Session feedback from participants
- `EmailConfig`: Email template configuration
- Document entities for file management per registration type

#### Azure Cosmos DB (NoSQL Database)

- **Setup**: Basic context created, ready for document collections
- **Configuration**: Optimized for performance with Direct connection mode
- **Usage**: Suitable for analytics, logs, metrics, and flexible document storage
- **Partitioning**: Ready to be configured based on specific use cases

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
