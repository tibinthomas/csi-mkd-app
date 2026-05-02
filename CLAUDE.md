# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CSI Madhya Kerala Diocese Premarital Counselling Centre** — a full-stack web application managing premarital and general counselling registrations with an admin dashboard. The app supports English and Malayalam, runs as a PWA, and is deployed on Azure.

## Repository Layout

```
Web app/
  csi-mkd-premarital-app-FE/   # Angular 21 frontend (PWA)
  csi-mkd-premarital-app-BE/   # ASP.NET Core 9 backend (minimal APIs)
```

Each sub-project has its own `CLAUDE.md` with detailed coding standards and commands. Read those before working inside a sub-project.

## Quick-Start Commands

### Frontend (`Web app/csi-mkd-premarital-app-FE/`)

```bash
npm start                              # Dev server → localhost:4200 (prod API)
ng serve --configuration=development   # Dev server → localhost:4200 (local API :5177)
ng build                               # Production build
ng test                                # Unit tests (Karma/Jasmine)
npm run gen-api                        # Regenerate API client from OpenAPI spec
npm run extract-i18n                   # Extract translation strings
./deploy.sh                            # Bump version, build, deploy to Azure SWA
```

### Backend (`Web app/csi-mkd-premarital-app-BE/`)

```bash
dotnet restore && dotnet build         # Restore + build
dotnet watch run                       # Dev server with hot reload → localhost:5177
dotnet test                            # Run tests
dotnet ef migrations add <Name>        # Add EF Core migration (PostgreSQL)
dotnet ef database update              # Apply migrations
dotnet ef dbcontext optimize           # Regenerate compiled models after schema changes
./deploy.sh                            # Build, containerize, deploy to Azure Container Apps
```

## System Architecture

The frontend and backend are independently deployed and communicate over HTTP:

- **Dev**: FE on `:4200` calls BE on `localhost:5177`
- **Prod**: FE on Azure Static Web Apps calls BE on Azure Container Apps

### Frontend Architecture (Angular 21)

- Standalone components with `ChangeDetectionStrategy.OnPush` and zoneless change detection
- Signal-based state; `inject()` over constructor injection
- Two layout shells: `PublicLayout` (registration flow) and `AdminLayout` (dashboard)
- `src/api/` is fully auto-generated — never hand-edit; run `npm run gen-api` after any backend OpenAPI change
- Auth: JWT stored client-side, `authInterceptor` attaches tokens, `authGuard` protects admin routes
- PWA service worker enabled in production only

### Backend Architecture (ASP.NET Core 9 Minimal APIs)

- Entry point `Program.cs` delegates entirely to four config classes: `ServiceConfiguration`, `MiddlewareConfiguration`, `EndpointConfiguration`, `StartupConfiguration`
- Feature-based endpoint files in `Endpoints/` (one file per domain: premarital, general, confirmation, sessions, auth, cache, etc.)
- Repository pattern over EF Core; services contain business logic, repositories handle data access
- **Dual database**: PostgreSQL (Npgsql/Supabase) as primary relational store; Azure Cosmos DB for analytics/flexible documents
- `CompiledModels/` are generated artifacts — regenerate with `dotnet ef dbcontext optimize` after schema changes, do not hand-edit

### Cache System

Output caching is tagged by resource type (`premarital-regs`, `general-regs`, …). `CacheInvalidationService` evicts relevant tags on writes. A background `CacheHealthService` monitors cache state. Admin endpoints at `/api/cache/*` allow manual control. See `CACHE_INVALIDATION_README.md` in the BE for details.

### Key External Dependencies

| Service | Purpose |
|---|---|
| Azure Static Web Apps | Frontend hosting |
| Azure Container Apps | Backend hosting |
| Supabase (PostgreSQL) | Primary relational DB |
| Azure Cosmos DB | Analytics / document store |
| Azure Blob Storage | File/document uploads |
| SendGrid | Transactional email |
| Google reCAPTCHA | Public form bot protection |
| Azure Application Insights | Frontend telemetry |

## Cross-Cutting Concerns

- **API contract**: backend exposes OpenAPI spec; frontend consumes it via `ng-openapi-gen`. Keep them in sync.
- **Auth flow**: admin logs in via `/api/auth`; BE issues JWT; FE stores and sends it on every admin request.
- **Logging (FE)**: `no-console` ESLint rule is enforced. Use `console.error`/`console.warn` only for critical issues; use Angular Material Snackbar for user feedback.
- **i18n**: English (`en`) is default; Malayalam (`ml`) translations live in `src/locale/`. Run `npm run extract-i18n` after adding new i18n markers.
