# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ASP.NET Core **.NET 10** minimal API backend for the CSI MKD Premarital Counselling registration system. The repo contains four projects:

| Project         | Path                                     | Purpose                                                                                                                                                      |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Main API        | `.` (`csi-mkd-premarital-app-BE.csproj`) | Minimal API serving all registration/admin endpoints; deployed to Azure Container Apps                                                                       |
| Azure Functions | `CsiMkdFunctions/`                       | Isolated-worker Functions app (v4): lightweight sessions read API, timer-based Supabase `pg_dump` backups, old-blob archival; deployed to Azure Function App |
| Aspire AppHost  | `AppHost/`                               | Local orchestrator that runs the Main API and Functions together                                                                                             |
| ServiceDefaults | `ServiceDefaults/`                       | Shared Aspire telemetry/health/resilience defaults, referenced by the Main API                                                                               |

The main `.csproj` explicitly excludes `AppHost/`, `ServiceDefaults/`, and `CsiMkdFunctions/` sources from its own compilation — they are separate projects. `CsiMkdFunctions` is **not** in the `.sln`; build/run it from its own directory.

The Angular frontend (`../csi-mkd-premarital-app-FE/`) generates its API client from this backend's OpenAPI spec. After changing any endpoint signature or DTO, the frontend must re-run `npm run gen-api`.

## Commands

```bash
# Build & run (Main API)
dotnet restore && dotnet build
dotnet watch run                 # Hot reload → http://localhost:5177 (Swagger at /swagger, dev only)
dotnet run --project AppHost     # Aspire: run Main API + Functions together

# Formatting (CSharpier is the configured tool)
dotnet tool restore
dotnet csharpier format .

# EF Core — PostgreSQL (primary context: ApplicationDbContext)
dotnet ef migrations add <Name>
dotnet ef database update
dotnet ef dbcontext optimize     # Regenerate CompiledModels/ after ANY schema change

# EF Core — Cosmos (CosmosDbContext)
dotnet ef database ensure-created --context CosmosDbContext

# Azure Functions (from CsiMkdFunctions/)
func start                       # Requires Azure Functions Core Tools v4 + local.settings.json

# Deployment (requires .env with secrets — see below)
./deploy.sh          # Deploys BOTH: main API + functions
./deploy-main.sh     # Main API only: multi-arch Docker build → Docker Hub → Azure Container App
./deploy-fn.sh       # Functions only
```

There is currently **no test project** — `dotnet test` finds nothing. If adding tests, create a separate test project following the AAA pattern with an in-memory/SQLite provider for EF Core.

## Architecture

### Startup flow

`Program.cs` is intentionally tiny — it delegates to four static classes in `Configuration/`:

1. `ServiceConfiguration.ConfigureServices` — DI registrations, rate limiting, output caching, JSON options, Swagger (dev only), CORS, both DbContexts, JWT auth
2. `MiddlewareConfiguration.ConfigureMiddleware` — pipeline order
3. `EndpointConfiguration.MapEndpoints` — maps every `Endpoints/*.cs` extension method plus `/health`, `/health/db`, `/health/cosmos`
4. `StartupConfiguration.ConfigureStartupTasks` — warmup

New services/repositories must be registered in `ServiceConfiguration.RegisterApplicationServices` (all scoped, interface-based). New endpoint files need a `Map*Endpoints` extension wired into `EndpointConfiguration`.

### Request flow

Endpoints (`Endpoints/`, one file per feature) → Services (`Services/`, business logic) → Repositories (`Repositories/`, EF Core data access). DTOs in `DTOs/`, entities in `models/`. Admin operations are protected with `.RequireAuthorization()`; public form submissions go through `IRecaptchaService` validation.

### Dual database

- **PostgreSQL** (Supabase) via `data/applicationDbContext.cs`: pooled DbContext (`AddDbContextPool`, pool size 128), retry-on-failure, `AuditSaveChangesInterceptor` (in `data/Interceptors/`) stamps audit entries on saves.
- **Cosmos DB** via `data/CosmosDbContext.cs`: registered **only if** `ConnectionStrings__CosmosConnection` is set — code touching Cosmos must tolerate its absence. Used for feedback/analytics documents; entity configurations live in `data/Configurations/`.

**Production-only behaviors** (not active under `dotnet watch run`): compiled models from `CompiledModels/` are loaded via `UseModel`, query tracking defaults to `NoTracking`, and JSON is compact. `CompiledModels/` is generated — never hand-edit; regenerate with `dotnet ef dbcontext optimize` after schema changes or production startup will use a stale model.

### Cache system

Read endpoints attach output-cache tags inline (e.g. `.CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)))`). On writes, services call `ICacheInvalidationService`, which evicts by tag. `CacheHealthService` monitors state; manual admin control lives at `/api/cache/*`. When adding a read endpoint, tag it; when adding a write path, invalidate the matching tag — details in `CACHE_INVALIDATION_README.md`.

### Security

- JWT bearer auth (`JwtSettings` config section) for admin endpoints; passwords hashed with BCrypt
- AspNetCoreRateLimit (in-memory): IP-based 2 req/s and 50 req/15min; client-based 10 req/s and 200 req/15min (`appsettings.json`)
- CORS allowlist in `ServiceConfiguration.ConfigureCors` — add new frontend origins there
- Secrets come from environment variables / `.env` (never committed). `deploy-main.sh` lists the full required set: PostgreSQL + Cosmos connection strings, `CosmosDb__DatabaseName`, `JwtSettings__*`, `SendGrid__ApiKey`, `AzureBlob__*`, `GoogleReCaptcha__SecretKey`, `DOCKER_PAT`

### CsiMkdFunctions specifics

Self-contained Functions project with its own `Program.cs`, repositories, and compiled models. Key functions: `FunctionsApi.cs` (GET `/api/sessions`, `/api/sessions/{year}`), `SupabaseBackupFunction.cs` (scheduled DB backups — see `BACKUP_README.md`, `PG_DUMP_SETUP.md`, `MANUAL_BACKUP_API.md`), `ArchiveOldBlobsFunction.cs`. It reads the same PostgreSQL database as the main API.

## Coding Standards

Follow Microsoft C#/.NET conventions. Project-specific expectations:

- Nullable reference types and implicit usings are enabled; keep code warning-clean
- PascalCase types/members, `_camelCase` private fields, `I`-prefixed interfaces; braces on new lines; 4-space indent; one class per file (~400 lines max)
- Async all the way down: EF async methods (`ToListAsync`, `SaveChangesAsync`), never `.Result`/`.Wait()`
- `AsNoTracking()` for read-only queries; `Include` over lazy loading; avoid premature `ToList()`
- DTOs for API responses — do not expose EF entities directly
- Constructor/DI over statics for business logic; configuration via `IOptions<T>` or `IConfiguration` sections
- Exceptions: catch specific types at boundaries, log via `ILogger<T>`, rethrow with `throw;` (not `throw ex;`), never swallow silently
- REST conventions: plural nouns, proper status codes, paginate large lists
- Schema changes always via EF migrations (`EnsureCreated` is acceptable only for Cosmos)
- Run `dotnet csharpier format .` before committing

# AI Session Manager (Advisory Mode)

Act as an intelligent session-management advisor alongside answering questions.
You cannot change settings yourself, so your job is to _recommend_ and let the
user act.

## On each user message, evaluate

- Task complexity.
- Conversation length and context quality.
- Whether the current reasoning effort seems appropriate.
- Whether the current model's capability matches the task.

## When worthwhile, suggest that the user take one of these actions in settings

- Increase reasoning effort.
- Decrease reasoning effort.
- Switch to a stronger model.
- Switch to a faster/cheaper model.
- Compact the conversation (offer to write the summary).
- Start a new chat (offer to write a concise handoff summary).
- Drop obsolete context that's no longer useful.

## Always provide

1. The recommendation, phrased as a step for the user to take.
2. A one-sentence reason.
3. The expected benefit (better quality, lower cost, faster responses, or
   improved context).

## Constraints

- Only interrupt when the improvement is genuinely worth it.
- You evaluate only when the user sends a message — you do not monitor between
  turns.
- You do not have exact token counts, so conversation-length calls are judgment,
  not precise metering.
