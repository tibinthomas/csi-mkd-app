# Sessions Azure Function

This Azure Function provides read-only access to session configuration data from the CSI MKD Premarital Counseling system.

## Endpoints

- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/{year}` - Get sessions by year

## Setup

1. Copy `.env.example` to `local.settings.json` and configure your database connection string
2. Install Azure Functions Core Tools: `npm install -g azure-functions-core-tools@4 --unsafe-perm true`
3. Run locally: `func start`

## Deployment

### Using the deployment script (Recommended):

1. Configure your environment variables in `.env.deployment`
2. Run the deployment script:

```bash
# Deploy with default environment file
./deploy.sh

# Deploy with specific environment file
./deploy.sh production .env.production

# Deploy with staging environment
./deploy.sh staging .env.staging
```

### Manual deployment:
Deploy to Azure Function App using Azure CLI or Visual Studio Code Azure Functions extension.

## Environment Variables

- `ConnectionStrings__DefaultConnection` - PostgreSQL connection string
- `AzureWebJobsStorage` - Azure Storage connection string
- `APPLICATIONINSIGHTS_CONNECTION_STRING` - Application Insights connection string (optional)

## Database Schema

The function expects a PostgreSQL database with the `SessionConfigurations` table matching the original API structure.