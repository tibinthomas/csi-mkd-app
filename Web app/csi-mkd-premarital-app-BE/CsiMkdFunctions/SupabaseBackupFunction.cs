using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Globalization;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CsiMkdFunctions
{
    public class SupabaseBackupFunction
    {
        private readonly ILogger<SupabaseBackupFunction> _logger;
        private readonly IConfiguration _configuration;

        public SupabaseBackupFunction(ILogger<SupabaseBackupFunction> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        [Function("SupabaseBackup")]
        public async Task Run([TimerTrigger("0 0 0,12 * * *")] TimerInfo myTimer)
        {
            _logger.LogInformation("Supabase backup function started at: {Time}", DateTime.UtcNow);

            try
            {
                await ExecuteBackup();

                _logger.LogInformation("Supabase backup completed successfully at: {Time}", DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during Supabase backup");
                throw;
            }

            if (myTimer.ScheduleStatus is not null)
            {
                _logger.LogInformation("Next backup scheduled for: {NextTime}", myTimer.ScheduleStatus.Next);
            }
        }

        [Function("TriggerBackup")]
        [OpenApiOperation(operationId: "TriggerBackup", tags: new[] { "Backup" }, Summary = "Manually trigger database backup", Description = "Triggers an immediate backup of the Supabase database to Azure Blob Storage")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(BackupResponse), Summary = "Success", Description = "Backup completed successfully")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Summary = "Error", Description = "Backup failed")]
        public async Task<HttpResponseData> TriggerBackup(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "backup/trigger")] HttpRequestData req)
        {
            _logger.LogInformation("Manual backup triggered via HTTP endpoint");

            try
            {
                var backupFileName = await ExecuteBackup();

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json; charset=utf-8");

                var backupResponse = new BackupResponse
                {
                    Success = true,
                    Message = "Backup completed successfully",
                    BackupFileName = backupFileName,
                    Timestamp = DateTime.UtcNow
                };

                await response.WriteStringAsync(JsonSerializer.Serialize(backupResponse, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }));

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during manual backup");

                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                errorResponse.Headers.Add("Content-Type", "application/json; charset=utf-8");

                await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new
                {
                    success = false,
                    message = "Backup failed",
                    error = ex.Message
                }));

                return errorResponse;
            }
        }

        private async Task<string> ExecuteBackup()
        {
            // Get configuration
            var connectionString = _configuration["ConnectionStrings__DefaultConnection"]
                ?? _configuration.GetConnectionString("DefaultConnection");
            var blobConnectionString = _configuration["AzureBlob__ConnectionString"]
                ?? _configuration["AzureBlob:ConnectionString"];
            var containerName = _configuration["SupabaseBackup__ContainerName"]
                ?? _configuration["SupabaseBackup:ContainerName"]
                ?? "supabase-backups";
            var retentionDays = int.Parse(_configuration["SupabaseBackup__RetentionDays"]
                ?? _configuration["SupabaseBackup:RetentionDays"]
                ?? "7");

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Database connection string not found in configuration");
            }

            if (string.IsNullOrEmpty(blobConnectionString))
            {
                throw new InvalidOperationException("Azure Blob connection string not found in configuration");
            }

            // Parse connection string
            var dbConfig = ParseConnectionString(connectionString);

            // Create backup
            var backupFileName = $"backup-{DateTime.UtcNow:yyyy-MM-dd-HHmmss}.sql.gz";
            var tempFilePath = Path.Combine(Path.GetTempPath(), backupFileName);

            _logger.LogInformation("Creating database backup: {FileName}", backupFileName);
            await CreateDatabaseBackup(dbConfig, tempFilePath);

            // Upload to blob storage
            _logger.LogInformation("Uploading backup to Azure Blob Storage");
            await UploadToBlob(blobConnectionString, containerName, tempFilePath, backupFileName);

            // Delete temp file
            if (File.Exists(tempFilePath))
            {
                File.Delete(tempFilePath);
                _logger.LogInformation("Deleted temporary backup file");
            }

            // Cleanup old backups
            _logger.LogInformation("Cleaning up backups older than {Days} days", retentionDays);
            await CleanupOldBackups(blobConnectionString, containerName, retentionDays);

            return backupFileName;
        }

        [Function("DownloadLatestBackup")]
        [OpenApiOperation(operationId: "DownloadLatestBackup", tags: new[] { "Backup" }, Summary = "Download latest backup", Description = "Downloads the most recent backup file from Azure Blob Storage")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/octet-stream", bodyType: typeof(byte[]), Summary = "Success", Description = "Returns the backup file")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.NotFound, contentType: "application/json", bodyType: typeof(object), Summary = "Not Found", Description = "No backups available")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Summary = "Error", Description = "Download failed")]
        public async Task<HttpResponseData> DownloadLatestBackup(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = "backup/download/latest")] HttpRequestData req)
        {
            _logger.LogInformation("Download latest backup requested via HTTP endpoint");

            try
            {
                // Get configuration
                var blobConnectionString = _configuration["AzureBlob__ConnectionString"]
                    ?? _configuration["AzureBlob:ConnectionString"];
                var containerName = _configuration["SupabaseBackup__ContainerName"]
                    ?? _configuration["SupabaseBackup:ContainerName"]
                    ?? "supabase-backups";

                if (string.IsNullOrEmpty(blobConnectionString))
                {
                    _logger.LogError("Azure Blob connection string not found in configuration");
                    var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                    await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new
                    {
                        success = false,
                        message = "Azure Blob connection string not configured"
                    }));
                    return errorResponse;
                }

                var blobServiceClient = new BlobServiceClient(blobConnectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

                if (!await containerClient.ExistsAsync())
                {
                    _logger.LogWarning("Backup container does not exist");
                    var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                    await notFoundResponse.WriteStringAsync(JsonSerializer.Serialize(new
                    {
                        success = false,
                        message = "No backups available"
                    }));
                    return notFoundResponse;
                }

                // Find the most recent backup
                BlobItem? latestBlob = null;
                DateTimeOffset latestTime = DateTimeOffset.MinValue;

                await foreach (var blobItem in containerClient.GetBlobsAsync())
                {
                    if (blobItem.Properties.CreatedOn.HasValue && 
                        blobItem.Properties.CreatedOn.Value > latestTime)
                    {
                        latestTime = blobItem.Properties.CreatedOn.Value;
                        latestBlob = blobItem;
                    }
                }

                if (latestBlob == null)
                {
                    _logger.LogWarning("No backups found in container");
                    var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                    await notFoundResponse.WriteStringAsync(JsonSerializer.Serialize(new
                    {
                        success = false,
                        message = "No backups available"
                    }));
                    return notFoundResponse;
                }

                _logger.LogInformation("Downloading latest backup: {BlobName}, Created: {CreatedOn}", 
                    latestBlob.Name, latestTime);

                // Download the blob
                var blobClient = containerClient.GetBlobClient(latestBlob.Name);
                var downloadResponse = await blobClient.DownloadAsync();

                // Create HTTP response with file content
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/octet-stream");
                response.Headers.Add("Content-Disposition", $"attachment; filename=\"{latestBlob.Name}\"");

                // Stream the blob content to the response
                await downloadResponse.Value.Content.CopyToAsync(response.Body);

                _logger.LogInformation("Successfully downloaded backup: {BlobName}", latestBlob.Name);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during backup download");

                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                errorResponse.Headers.Add("Content-Type", "application/json; charset=utf-8");

                await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new
                {
                    success = false,
                    message = "Download failed",
                    error = ex.Message
                }));

                return errorResponse;
            }
        }

        private DatabaseConfig ParseConnectionString(string connectionString)
        {
            var config = new DatabaseConfig();
            
            var patterns = new Dictionary<string, string>
            {
                { "Host", @"Server=([^;]+)" },
                { "Port", @"Port=([^;]+)" },
                { "Database", @"Database=([^;]+)" },
                { "Username", @"User Id=([^;]+)" },
                { "Password", @"Password=([^;]+)" }
            };

            foreach (var pattern in patterns)
            {
                var match = Regex.Match(connectionString, pattern.Value, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    switch (pattern.Key)
                    {
                        case "Host":
                            config.Host = match.Groups[1].Value;
                            break;
                        case "Port":
                            config.Port = match.Groups[1].Value;
                            break;
                        case "Database":
                            config.Database = match.Groups[1].Value;
                            break;
                        case "Username":
                            config.Username = match.Groups[1].Value;
                            break;
                        case "Password":
                            config.Password = match.Groups[1].Value;
                            break;
                    }
                }
            }

            return config;
        }

        private async Task CreateDatabaseBackup(DatabaseConfig dbConfig, string outputPath)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "pg_dump",
                Arguments = $"-h {dbConfig.Host} -p {dbConfig.Port} -U {dbConfig.Username} -d {dbConfig.Database} -Fc -f \"{outputPath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            // Set password via environment variable
            startInfo.EnvironmentVariables["PGPASSWORD"] = dbConfig.Password;

            using var process = new Process { StartInfo = startInfo };
            
            var output = new System.Text.StringBuilder();
            var error = new System.Text.StringBuilder();

            process.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    output.AppendLine(e.Data);
                }
            };

            process.ErrorDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    error.AppendLine(e.Data);
                }
            };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                var errorMessage = error.ToString();
                _logger.LogError("pg_dump failed with exit code {ExitCode}. Error: {Error}", 
                    process.ExitCode, errorMessage);
                throw new InvalidOperationException($"pg_dump failed: {errorMessage}");
            }

            if (!File.Exists(outputPath))
            {
                throw new InvalidOperationException("Backup file was not created");
            }

            _logger.LogInformation("Database backup created successfully. Size: {Size} bytes", 
                new FileInfo(outputPath).Length);
        }

        private async Task UploadToBlob(string connectionString, string containerName, string filePath, string blobName)
        {
            var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

            // Create container if it doesn't exist
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            var blobClient = containerClient.GetBlobClient(blobName);

            using var fileStream = File.OpenRead(filePath);
            await blobClient.UploadAsync(fileStream, overwrite: true);

            _logger.LogInformation("Backup uploaded to blob storage: {BlobName}", blobName);
        }

        private async Task CleanupOldBackups(string connectionString, string containerName, int retentionDays)
        {
            var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

            if (!await containerClient.ExistsAsync())
            {
                _logger.LogInformation("Container does not exist, skipping cleanup");
                return;
            }

            var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);
            var deletedCount = 0;

            await foreach (var blobItem in containerClient.GetBlobsAsync())
            {
                if (blobItem.Properties.CreatedOn.HasValue && 
                    blobItem.Properties.CreatedOn.Value.UtcDateTime < cutoffDate)
                {
                    var blobClient = containerClient.GetBlobClient(blobItem.Name);
                    await blobClient.DeleteIfExistsAsync();
                    deletedCount++;
                    _logger.LogInformation("Deleted old backup: {BlobName}, Created: {CreatedOn}", 
                        blobItem.Name, blobItem.Properties.CreatedOn.Value.UtcDateTime);
                }
            }

            _logger.LogInformation("Cleanup completed. Deleted {Count} old backup(s)", deletedCount);
        }

        private class DatabaseConfig
        {
            public string Host { get; set; } = string.Empty;
            public string Port { get; set; } = "5432";
            public string Database { get; set; } = string.Empty;
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        private class BackupResponse
        {
            public bool Success { get; set; }
            public string Message { get; set; } = string.Empty;
            public string BackupFileName { get; set; } = string.Empty;
            public DateTime Timestamp { get; set; }
        }
    }
}
