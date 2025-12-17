using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace csi_mkd_premarital_app_BE.Services;

public class BackupService : IBackupService
{
    private readonly ILogger<BackupService> _logger;
    private readonly IConfiguration _configuration;

    public BackupService(ILogger<BackupService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<string> TriggerBackupAsync()
    {
        _logger.LogInformation("Manual backup triggered");

        // Get configuration
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        var blobConnectionString = _configuration["AzureBlob:ConnectionString"];
        var containerName = _configuration["SupabaseBackup:ContainerName"] ?? "supabase-backups";
        var retentionDays = int.Parse(_configuration["SupabaseBackup:RetentionDays"] ?? "7");

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

    public async Task<(Stream stream, string filename)?> DownloadLatestBackupAsync()
    {
        _logger.LogInformation("Download latest backup requested");

        // Get configuration
        var blobConnectionString = _configuration["AzureBlob:ConnectionString"];
        var containerName = _configuration["SupabaseBackup:ContainerName"] ?? "supabase-backups";

        if (string.IsNullOrEmpty(blobConnectionString))
        {
            _logger.LogError("Azure Blob connection string not found in configuration");
            throw new InvalidOperationException("Azure Blob connection string not configured");
        }

        var blobServiceClient = new BlobServiceClient(blobConnectionString);
        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

        if (!await containerClient.ExistsAsync())
        {
            _logger.LogWarning("Backup container does not exist");
            return null;
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
            return null;
        }

        _logger.LogInformation("Downloading latest backup: {BlobName}, Created: {CreatedOn}",
            latestBlob.Name, latestTime);

        // Download the blob
        var blobClient = containerClient.GetBlobClient(latestBlob.Name);
        var downloadResponse = await blobClient.DownloadAsync();

        return (downloadResponse.Value.Content, latestBlob.Name);
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
}
