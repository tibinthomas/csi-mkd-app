# Supabase Backup Function

## Overview

This Azure Function automatically backs up the Supabase PostgreSQL database to Azure Blob Storage on a scheduled basis. It also manages backup retention by automatically deleting old backups.

## Features

- **Automated Backups**: Runs twice daily at 00:00 (midnight) and 12:00 (noon) UTC
- **Compressed Backups**: Uses `pg_dump` with custom format compression (`-Fc`) for efficient storage
- **Azure Blob Storage**: Securely stores backups in Azure Blob Storage
- **Auto Cleanup**: Automatically deletes backups older than the configured retention period (default: 7 days)
- **Comprehensive Logging**: Logs all operations for monitoring and troubleshooting

## Configuration

### Environment Variables

The function requires the following configuration settings:

#### Required Settings

- **ConnectionStrings__DefaultConnection**: Supabase database connection string
  - Format: `User Id=<username>;Password=<password>;Server=<host>;Port=<port>;Database=<database>;SSL Mode=Require;Trust Server Certificate=true`
  - Already configured in your existing setup

- **AzureBlob__ConnectionString**: Azure Storage connection string
  - Already configured in your existing setup
  - Used for uploading backups to blob storage

#### Optional Settings

- **SupabaseBackup__ContainerName**: Name of the blob container for backups
  - Default: `supabase-backups`
  - The container will be created automatically if it doesn't exist

- **SupabaseBackup__RetentionDays**: Number of days to retain backups
  - Default: `7`
  - Backups older than this will be automatically deleted

### Local Development

Configuration is stored in `local.settings.json`:

```json
{
  "Values": {
    "ConnectionStrings__DefaultConnection": "<your-supabase-connection-string>",
    "AzureBlob__ConnectionString": "<your-azure-blob-connection-string>",
    "SupabaseBackup__ContainerName": "supabase-backups",
    "SupabaseBackup__RetentionDays": "7"
  }
}
```

### Azure Deployment

When deploying to Azure Functions, set these as Application Settings:

1. Go to your Function App in Azure Portal
2. Navigate to **Configuration** > **Application settings**
3. Add/verify the following settings:
   - `ConnectionStrings__DefaultConnection`
   - `AzureBlob__ConnectionString`
   - `SupabaseBackup__ContainerName` (optional)
   - `SupabaseBackup__RetentionDays` (optional)

## Backup Schedule

The function uses a timer trigger with NCRON expression: `0 0 0,12 * * *`

This translates to:
- **00:00 UTC** (midnight) - First daily backup
- **12:00 UTC** (noon) - Second daily backup

### Modifying the Schedule

To change the backup schedule, edit the `TimerTrigger` attribute in `SupabaseBackupFunction.cs`:

```csharp
[Function("SupabaseBackup")]
public async Task Run([TimerTrigger("0 0 0,12 * * *")] TimerInfo myTimer)
```

NCRON format: `{second} {minute} {hour} {day} {month} {day-of-week}`

Examples:
- Every hour: `0 0 * * * *`
- Every 6 hours: `0 0 */6 * * *`
- Once daily at 2 AM: `0 0 2 * * *`
- Three times daily (midnight, 8 AM, 4 PM): `0 0 0,8,16 * * *`

## Manual Trigger API

You can manually trigger a backup anytime using the HTTP API endpoint.

### Endpoint

**POST** `/api/backup/trigger`

**Authorization**: Function key required

### Local Development

```bash
# Trigger backup locally
curl -X POST http://localhost:7071/api/backup/trigger
```

### Azure (Production)

```bash
# Get your function key from Azure Portal
# Or use this command:
FUNCTION_KEY=$(az functionapp function keys list \
  --name fn-app-csi-mkd-counselling \
  --resource-group csi-mkd-premarital-counsel-app \
  --function-name TriggerBackup \
  --query "default" -o tsv)

# Trigger backup
curl -X POST "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/trigger?code=$FUNCTION_KEY"
```

### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Backup completed successfully",
  "backupFileName": "backup-2025-12-15-165432.sql.gz",
  "timestamp": "2025-12-15T16:54:32.123Z"
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Backup failed",
  "error": "Database connection string not found in configuration"
}
```

### OpenAPI/Swagger Documentation

The manual trigger API is documented with OpenAPI attributes. Access the Swagger UI at:

**Local**: http://localhost:7071/api/swagger/ui

**Azure**: https://fn-app-csi-mkd-counselling.azurewebsites.net/api/swagger/ui

## Download Latest Backup API

You can download the most recent backup file using the HTTP API endpoint.

### Endpoint

**GET** `/api/backup/download/latest`

**Authorization**: Function key required

### Local Development

```bash
# Download latest backup locally
curl -X GET http://localhost:7071/api/backup/download/latest -o latest-backup.sql.gz

# Or with wget
wget http://localhost:7071/api/backup/download/latest -O latest-backup.sql.gz
```

### Azure (Production)

```bash
# Get your function key from Azure Portal
# Or use this command:
FUNCTION_KEY=$(az functionapp function keys list \
  --name fn-app-csi-mkd-counselling \
  --resource-group csi-mkd-premarital-counsel-app \
  --function-name DownloadLatestBackup \
  --query "default" -o tsv)

# Download latest backup
curl -X GET "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code=$FUNCTION_KEY" \
  -o latest-backup.sql.gz
```

### Response

**Success (200 OK):**
- **Content-Type**: `application/octet-stream`
- **Content-Disposition**: `attachment; filename="backup-2025-12-15-165432.sql.gz"`
- **Body**: Binary file content

**No Backups (404 Not Found):**
```json
{
  "success": false,
  "message": "No backups available"
}
```

**Error (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Download failed",
  "error": "Azure Blob connection string not configured"
}
```

### Usage Examples

**Download and save with original filename:**
```bash
# This will automatically use the backup filename
curl -OJ "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code=$FUNCTION_KEY"
```

**Download and pipe to pg_restore:**
```bash
# Download and restore in one command
curl -s "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code=$FUNCTION_KEY" | \
  pg_restore -h localhost -U postgres -d my_database -c
```

**PowerShell:**
```powershell
$functionKey = "YOUR_FUNCTION_KEY"
$url = "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code=$functionKey"
Invoke-WebRequest -Uri $url -OutFile "latest-backup.sql.gz"
```

## Backup File Format

Backups are named with a timestamp: `backup-YYYY-MM-DD-HHmmss.sql.gz`

Example: `backup-2025-12-15-120000.sql.gz`

The backups are created using `pg_dump` with the custom format (`-Fc`), which provides:
- Compression for smaller file sizes
- Parallel restore capabilities
- Selective restore options

## Manual Trigger (Local Development)

### Option 1: HTTP API (Recommended)

Trigger via the HTTP endpoint:

```bash
# Start the function app
cd CsiMkdFunctions
func start

# In another terminal, trigger the backup
curl -X POST http://localhost:7071/api/backup/trigger
```

**Response:**
```json
{
  "success": true,
  "message": "Backup completed successfully",
  "backupFileName": "backup-2025-12-15-165432.sql.gz",
  "timestamp": "2025-12-15T16:54:32.123Z"
}
```

### Option 2: Admin Endpoint

Trigger via the Azure Functions admin endpoint:

```bash
curl -X POST http://localhost:7071/admin/functions/SupabaseBackup
```

## Manual Trigger (Azure)

### Option 1: HTTP API (Recommended)

```bash
# Get your function key
FUNCTION_KEY=$(az functionapp function keys list \
  --name fn-app-csi-mkd-counselling \
  --resource-group csi-mkd-premarital-counsel-app \
  --function-name TriggerBackup \
  --query "default" -o tsv)

# Trigger backup
curl -X POST "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/trigger?code=$FUNCTION_KEY"
```

### Option 2: Azure Portal

To manually trigger in Azure Portal:

1. Go to Azure Portal
2. Navigate to your Function App
3. Select **Functions** > **SupabaseBackup**
4. Click **Code + Test**
5. Click **Test/Run**
6. Click **Run**

## Monitoring

### Logs

View logs in:
- **Local**: Console output when running locally
- **Azure**: Azure Portal > Function App > Functions > SupabaseBackup > Monitor

### What to Monitor

- Successful backup creation and upload
- Cleanup operations (number of old backups deleted)
- Any errors or warnings
- Next scheduled execution time

## Restoring from Backup

To restore a backup:

1. Download the backup file from Azure Blob Storage
2. Extract the file (it's in PostgreSQL custom format, not gzipped despite the .gz extension)
3. Use `pg_restore` to restore:

```bash
pg_restore -h <host> -p <port> -U <username> -d <database> -c backup-2025-12-15-120000.sql.gz
```

Options:
- `-c`: Clean (drop) database objects before recreating
- `-d`: Target database name
- Use `-v` for verbose output

## Requirements

### Local Development

- PostgreSQL client tools (including `pg_dump`) must be installed
- Azure Storage Emulator or valid Azure Storage connection string
- .NET 10 SDK

### Azure Functions (Linux)

- `pg_dump` is typically available in the Linux runtime
- No additional configuration needed

### Azure Functions (Windows)

- May require custom deployment with PostgreSQL tools
- Consider using Linux-based Function App for easier pg_dump availability

## Troubleshooting

### "pg_dump command not found"

**Cause**: PostgreSQL client tools not installed

**Solution**:
- macOS: `brew install postgresql`
- Linux: `apt-get install postgresql-client`
- Windows: Install PostgreSQL from official website or use WSL
- Azure: Use Linux-based Function App

### "Container not found" error

**Cause**: Azure Blob container doesn't exist

**Solution**: The function automatically creates the container, but ensure the connection string has proper permissions

### Backups not being deleted

**Cause**: Retention policy not working

**Solution**: 
- Check `SupabaseBackup__RetentionDays` is set correctly
- Verify blob creation timestamps in Azure Portal
- Check function logs for cleanup operation details

### Connection timeout or authentication errors

**Cause**: Invalid database connection string or credentials

**Solution**:
- Verify Supabase connection string is correct
- Ensure SSL is enabled (`SSL Mode=Require`)
- Check firewall rules allow connections from Azure Functions

## Security Considerations

- Connection strings contain sensitive credentials - never commit them to source control
- Use Azure Key Vault for production secrets
- Blob container uses private access (no public access)
- Backups contain full database - ensure proper access controls on the storage account
- Consider encrypting backups at rest (Azure Storage provides this by default)

## Cost Considerations

- Azure Blob Storage costs apply based on:
  - Storage size (compressed backups)
  - Number of operations (uploads, deletions, listings)
  - Data egress (if downloading backups)
- Typical cost for 7 days of twice-daily backups: minimal (<$1/month for small databases)
- Adjust retention period to balance between cost and recovery options
