# Ensuring pg_dump Availability in Azure Functions

This document explains how to ensure `pg_dump` is available in your Azure Function App for the Supabase backup function.

## The Problem

Azure Functions on Linux (with .NET isolated runtime) do not come with PostgreSQL client tools (`pg_dump`) pre-installed. Since our backup function relies on `pg_dump` to create database backups, we need to install it.

## Solution Options

### ✅ Option 1: Startup Command (Recommended)

**Easiest and most reliable approach**

The deployment script (`deploy-fn.sh`) has been updated to automatically configure a startup command that installs PostgreSQL client tools when the Function App starts.

#### What happens during deployment:

1. The script sets a startup command via Azure CLI
2. When the Function App starts, it runs: `apt-get update && apt-get install -y postgresql-client`
3. This installs `pg_dump` and related PostgreSQL tools
4. Your backup function can then use `pg_dump`

#### Already configured in `deploy-fn.sh`:

```bash
az functionapp config set \
    --name "$FUNCTION_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --startup-file "apt-get update && apt-get install -y postgresql-client && echo 'PostgreSQL client installed'"
```

**No additional steps needed!** Just deploy using `./deploy-fn.sh`

---

### Option 2: Manual Configuration via Azure Portal

If the automated deployment doesn't work, you can manually configure it:

1. **Open Azure Portal**: https://portal.azure.com
2. **Navigate to your Function App**: `fn-app-csi-mkd-counselling`
3. **Go to Configuration** → **General settings**
4. **Find "Startup Command"** field
5. **Enter**:
   ```bash
   apt-get update && apt-get install -y postgresql-client
   ```
6. **Click Save**
7. **Restart the Function App**

---

### Option 3: Custom Docker Container (Advanced)

For more control, create a custom Docker image with PostgreSQL tools pre-installed.

#### Create `Dockerfile` in `CsiMkdFunctions/`:

```dockerfile
FROM mcr.microsoft.com/azure-functions/dotnet-isolated:4-dotnet-isolated8.0

# Install PostgreSQL client tools
RUN apt-get update && \
    apt-get install -y postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Copy function app
COPY . /home/site/wwwroot

# Set working directory
WORKDIR /home/site/wwwroot
```

#### Deploy with Docker:

1. Build the image:
   ```bash
   docker build -t csi-mkd-functions:latest ./CsiMkdFunctions
   ```

2. Push to Azure Container Registry (ACR)
3. Configure Function App to use custom container

**Note**: Requires Premium or Dedicated Azure Functions plan.

---

## Verification

### After Deployment

1. **Check if pg_dump is installed**:
   - Go to Azure Portal → Function App → Development Tools → **Console** or **SSH**
   - Run: `pg_dump --version`
   - Should show: `pg_dump (PostgreSQL) 14.x` or similar

2. **Check startup logs**:
   - Azure Portal → Function App → **Log stream**
   - Look for: `PostgreSQL client installed`

3. **Test the backup function**:
   - Manually trigger: Functions → SupabaseBackup → Code + Test → Run
   - Check logs for successful backup creation

### Troubleshooting

**If startup command doesn't work:**

- Ensure Function App is running on **Linux** (not Windows)
- Check that you have **Contributor** or **Owner** role on the resource
- Try manual configuration via Portal (Option 2)

**If pg_dump is not found:**

- The startup command may not have run
- Check the App Service logs for installation errors
- Consider using Docker approach (Option 3)

**Permissions issues:**

- Startup commands run as root user, so `apt-get install` should work
- If it fails, the Function App might not have internet access

---

## Current Configuration

### Deployment Script
✅ **File**: `deploy-fn.sh`  
✅ **Includes**: Startup command configuration  
✅ **Includes**: Backup settings (`SupabaseBackup__ContainerName`, `SupabaseBackup__RetentionDays`)

### Startup Script
📄 **File**: `startup.sh` (created but not needed with startup command approach)  
ℹ️ This is a fallback option if you need more complex startup logic

---

## Best Practices

1. **Use Linux runtime**: Always use Linux-based Azure Functions for PostgreSQL tools
2. **Monitor startup logs**: After first deployment, check logs to ensure pg_dump installed successfully
3. **Test thoroughly**: Manually trigger the backup function after deployment
4. **Plan upgrade**: Consider Premium/Dedicated plan for custom Docker if needed

---

## Summary

**Current Setup**: ✅ Automated via deployment script

**Action Required**: None - just deploy using `./deploy-fn.sh`

**Verification**: After deployment, check console for `pg_dump --version`

**Fallback**: Manual Portal configuration (Option 2) if automation fails
