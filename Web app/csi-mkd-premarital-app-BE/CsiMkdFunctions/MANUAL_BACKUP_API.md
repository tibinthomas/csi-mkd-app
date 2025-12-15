# Manual Backup API - Quick Reference

## 🚀 Quick Start

### Local Testing

```bash
# Start the Functions app
cd CsiMkdFunctions
func start

# Trigger a backup (in another terminal)
curl -X POST http://localhost:7071/api/backup/trigger
```

### Production (Azure)

```bash
# Get function key
FUNCTION_KEY=$(az functionapp function keys list \
  --name fn-app-csi-mkd-counselling \
  --resource-group csi-mkd-premarital-counsel-app \
  --function-name TriggerBackup \
  --query "default" -o tsv)

# Trigger backup
curl -X POST "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/trigger?code=$FUNCTION_KEY"

# Download latest backup
DOWNLOAD_KEY=$(az functionapp function keys list \
  --name fn-app-csi-mkd-counselling \
  --resource-group csi-mkd-premarital-counsel-app \
  --function-name DownloadLatestBackup \
  --query "default" -o tsv)

curl -X GET "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code=$DOWNLOAD_KEY" \
  -o latest-backup.sql.gz
```

---

## 📡 API Endpoints

### 1. Trigger Manual Backup

**Endpoint**: `POST /api/backup/trigger`

**Endpoint**: `POST /api/backup/trigger`

**Authorization**: Function-level (requires function key for production)

**Content-Type**: `application/json`

---

## 📥 Request

**Method**: POST

**URL**: 
- Local: `http://localhost:7071/api/backup/trigger`
- Azure: `https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/trigger?code={FUNCTION_KEY}`

**Headers**: None required for local, function key in query string for Azure

**Body**: None required

---

## 📤 Response

### ✅ Success (200 OK)

```json
{
  "success": true,
  "message": "Backup completed successfully",
  "backupFileName": "backup-2025-12-15-165432.sql.gz",
  "timestamp": "2025-12-15T16:54:32.123Z"
}
```

**Fields**:
- `success` (boolean): Always `true` for successful backups
- `message` (string): Human-readable success message
- `backupFileName` (string): Name of the created backup file in Azure Blob Storage
- `timestamp` (string): UTC timestamp when the backup was completed

### ❌ Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Backup failed",
  "error": "Database connection string not found in configuration"
}
```

**Fields**:
- `success` (boolean): Always `false` for failed backups
- `message` (string): Human-readable error message
- `error` (string): Detailed error description

---

### 2. Download Latest Backup

**Endpoint**: `GET /api/backup/download/latest`

**Authorization**: Function-level (requires function key for production)

**Content-Type**: Response will be `application/octet-stream`

---

## 📥 Download Request

**Method**: GET

**URL**: 
- Local: `http://localhost:7071/api/backup/download/latest`
- Azure: `https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code={FUNCTION_KEY}`

**Headers**: None required for local, function key in query string for Azure

**Body**: None

---

## 📤 Download Response

### ✅ Success (200 OK)

**Headers**:
- `Content-Type`: `application/octet-stream`
- `Content-Disposition`: `attachment; filename="backup-2025-12-15-165432.sql.gz"`

**Body**: Binary file content (the actual backup file)

### ❌ No Backups (404 Not Found)

```json
{
  "success": false,
  "message": "No backups available"
}
```

### ❌ Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Download failed",
  "error": "Azure Blob connection string not configured"
}
```

---

## 🔑 Getting Function Keys

### Via Azure Portal

1. Go to **Azure Portal** → **fn-app-csi-mkd-counselling**
2. Navigate to **Functions** → **TriggerBackup**
3. Click **Function Keys**
4. Copy the `default` key value

### Via Azure CLI

```bash
az functionapp function keys list \
  --name fn-app-csi-mkd-counselling \
  --resource-group csi-mkd-premarital-counsel-app \
  --function-name TriggerBackup \
  --query "default" -o tsv
```

---

## 📝 Example Requests

### Using curl

**Trigger Backup:**
```bash
# Local
curl -X POST http://localhost:7071/api/backup/trigger

# Azure (with key)
curl -X POST "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/trigger?code=YOUR_FUNCTION_KEY"
```

**Download Latest Backup:**
```bash
# Local
curl -X GET http://localhost:7071/api/backup/download/latest -o latest-backup.sql.gz

# Azure (with key)
curl -X GET "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code=YOUR_DOWNLOAD_KEY" \
  -o latest-backup.sql.gz

# Download with original filename
curl -OJ "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code=YOUR_DOWNLOAD_KEY"
```

### Using PowerShell

**Trigger Backup:**
```powershell
# Local
Invoke-RestMethod -Uri "http://localhost:7071/api/backup/trigger" -Method POST

# Azure
$functionKey = "YOUR_FUNCTION_KEY"
Invoke-RestMethod -Uri "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/trigger?code=$functionKey" -Method POST
```

**Download Latest Backup:**
```powershell
# Local
Invoke-WebRequest -Uri "http://localhost:7071/api/backup/download/latest" -OutFile "latest-backup.sql.gz"

# Azure
$downloadKey = "YOUR_DOWNLOAD_KEY"
$url = "https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code=$downloadKey"
Invoke-WebRequest -Uri $url -OutFile "latest-backup.sql.gz"
```

### Using JavaScript/Fetch

**Trigger Backup:**
```javascript
// Local
fetch('http://localhost:7071/api/backup/trigger', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log(data));

// Azure
const functionKey = 'YOUR_FUNCTION_KEY';
fetch(`https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/trigger?code=${functionKey}`, {
  method: 'POST'
})
  .then(res => res.json())
  .then(data => console.log(data));
```

**Download Latest Backup (Browser):**
```javascript
// Azure - trigger download in browser
const downloadKey = 'YOUR_DOWNLOAD_KEY';
const url = `https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code=${downloadKey}`;

// Option 1: Direct link
window.location.href = url;

// Option 2: Fetch and create blob
fetch(url)
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup.sql.gz';
    a.click();
  });
```

### Using Python

**Trigger Backup:**
```python
import requests

# Local
response = requests.post('http://localhost:7071/api/backup/trigger')
print(response.json())

# Azure
function_key = 'YOUR_FUNCTION_KEY'
url = f'https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/trigger?code={function_key}'
response = requests.post(url)
print(response.json())
```

**Download Latest Backup:**
```python
import requests

# Local
url = 'http://localhost:7071/api/backup/download/latest'
response = requests.get(url)

with open('latest-backup.sql.gz', 'wb') as f:
    f.write(response.content)

# Azure
download_key = 'YOUR_DOWNLOAD_KEY'
url = f'https://fn-app-csi-mkd-counselling.azurewebsites.net/api/backup/download/latest?code={download_key}'
response = requests.get(url)

# Get filename from Content-Disposition header
import re
filename = re.findall('filename="(.+)"', response.headers.get('Content-Disposition', ''))[0]

with open(filename, 'wb') as f:
    f.write(response.content)
    
print(f'Downloaded: {filename}')
```

---

## 🔍 What Happens During a Backup

1. **Configuration Validation**: Checks database and blob storage connection strings
2. **Database Dump**: Executes `pg_dump` to create compressed backup
3. **Upload to Blob**: Uploads backup to Azure Blob Storage container `supabase-backups`
4. **Cleanup**: Deletes backups older than the retention period (default: 7 days)
5. **Response**: Returns success/failure with backup details

**Typical Execution Time**: 10-60 seconds (depends on database size)

---

## 🛠️ Troubleshooting

### Issue: 401 Unauthorized (Azure)

**Cause**: Missing or invalid function key

**Solution**: 
- Ensure you're passing the function key in the query string: `?code=YOUR_KEY`
- Get a fresh key from Azure Portal or CLI

### Issue: 500 Internal Server Error

**Cause**: Configuration or runtime error

**Solution**:
- Check Azure Function logs for detailed error
- Verify connection strings are configured
- Ensure `pg_dump` is installed (check startup logs)

### Issue: Timeout

**Cause**: Large database taking too long

**Solution**:
- Increase timeout in `host.json` (default is 5 minutes for consumption plan)
- Consider upgrading to Premium plan for longer timeouts
- Check database connectivity

---

## 📊 Monitoring

### Check Logs Locally

Function output will show in the terminal where you ran `func start`

### Check Logs in Azure

**Option 1: Azure Portal**
- Go to Function App → Functions → TriggerBackup → Monitor
- View invocation logs and execution details

**Option 2: Azure CLI**
```bash
az functionapp log tail \
  --name fn-app-csi-mkd-counselling \
  --resource-group csi-mkd-premarital-counsel-app
```

**Option 3: Application Insights**
- Navigate to Application Insights linked to your Function App
- Query logs for detailed execution traces

---

## 🔐 Security Notes

- **Function Keys**: Keep function keys secure, do not commit to source control
- **Authorization Level**: Set to `Function` (requires key) - not `Anonymous`
- **HTTPS Only**: Always use HTTPS in production
- **Network Security**: Consider using Azure Private Endpoints for additional security
- **Key Rotation**: Regularly rotate function keys via Azure Portal

---

## 📚 Additional Resources

- [BACKUP_README.md](./BACKUP_README.md) - Full backup function documentation
- [PG_DUMP_SETUP.md](./PG_DUMP_SETUP.md) - PostgreSQL tools setup guide
- [Azure Functions HTTP Triggers](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger)
- [OpenAPI/Swagger UI](https://fn-app-csi-mkd-counselling.azurewebsites.net/api/swagger/ui)
