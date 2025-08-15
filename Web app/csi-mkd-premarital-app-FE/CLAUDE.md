# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 20 application for the CSI Madhya Kerala Diocese Premarital Counselling Centre. It's a Progressive Web App (PWA) with internationalization support (English/Malayalam) that manages premarital and general counselling registrations with an admin dashboard.

## Common Commands

### Development

- `npm start` or `ng serve` - Start development server (localhost:4200)
- `ng serve --configuration=development` - Development server with dev API endpoint (localhost:5177)
- `ng build` - Production build
- `ng build --configuration=development` - Development build with local API
- `ng test` - Run unit tests with Karma

### API Generation

- `npm run gen-api` - Generate API client from OpenAPI spec (updates src/api/ directory)

### Internationalization

- `npm run extract-i18n` - Extract i18n messages for translation

### Deployment

- `./deploy.sh` - Full deployment script (version bump, build, deploy to Azure Static Web Apps)

## Architecture Overview

### Core Structure

- **Standalone Components**: Uses modern Angular 20 standalone components architecture
- **Zoneless Change Detection**: Configured with `provideZonelessChangeDetection()`
- **Signal-based State**: Leverages Angular signals for reactive state management
- **Lazy Loading**: All route components are lazy-loaded for performance
- **Two-Layout System**: Separate layouts for public and admin areas

### Key Directories

- `src/api/` - Auto-generated API client (from OpenAPI spec)
- `src/app/layouts/` - Layout components (PublicLayout, AdminLayout)
- `src/app/register/` - Registration components (premarital, general, confirmation)
- `src/app/admin/` - Admin dashboard and management components
- `src/app/core/` - Core services (auth, interceptors, validators)
- `src/app/shared/` - Shared components and directives

### Authentication & Security

- JWT-based authentication with token interceptor
- Route guards protect admin routes (`authGuard`)
- Rate limiting interceptor for API calls
- Custom validators for email domains and unique emails

### API Integration

- Generated API client from backend OpenAPI specification
- Environment-based API endpoints (localhost for dev, Azure Container Apps for prod)
- Services auto-generated in `src/api/services/`

### Internationalization

- Support for English (en) and Malayalam (ml)
- Translation files in `src/locale/`
- Angular i18n with localize polyfill

### PWA Features

- Service worker configured for production
- Web manifest for installability
- Optimized caching strategies

### Styling & UI

- Angular Material with azure-blue theme
- SCSS for component styles
- TailwindCSS integration
- Responsive design patterns

## Development Guidelines

### Component Development

- Follow Angular 20+ patterns from `instructions.md`
- Use standalone components (default)
- Implement `ChangeDetectionStrategy.OnPush`
- Use signals for state management
- Use modern control flow (`@if`, `@for`, `@switch`)

### API Updates

- Run `npm run gen-api` after backend OpenAPI spec changes
- API configuration handles different environments automatically
- Custom interceptors handle authentication and rate limiting

### Testing

- Unit tests with Jasmine and Karma
- Test files follow `*.spec.ts` naming convention
- Run tests with `ng test`

### Build Configurations

- **Development**: Uses localhost:5177 API, source maps enabled
- **Production**: Uses Azure Container Apps API, optimized build, service worker enabled

## Deployment

The project deploys to Azure Static Web Apps using the `deploy.sh` script which:

1. Bumps version with `npm version patch`
2. Builds with production configuration
3. Handles i18n build artifacts
4. Deploys using Azure SWA CLI

## Environment Configuration

- Development API: `http://localhost:5177`
- Production API: Azure Container Apps endpoint
- Node.js >= 22.0.0 required
- npm >= 10.0.0 required

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- DO NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
