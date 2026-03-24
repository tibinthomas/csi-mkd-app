using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CsiMkdFunctions;

public class ArchiveOldBlobsFunction
{
    private readonly ILogger<ArchiveOldBlobsFunction> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _containerName = "register-documents";

    public ArchiveOldBlobsFunction(ILogger<ArchiveOldBlobsFunction> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    [Function("ArchiveOldBlobs")]
    public async Task Run([TimerTrigger("0 0 0 1 * *")] TimerInfo myTimer)
    {
        _logger.LogInformation("ArchiveOldBlobs function triggered at: {Time}", DateTime.UtcNow);

        try
        {
            var connectionString = _configuration["AzureBlob:ConnectionString"];
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("AzureBlob:ConnectionString is missing in configuration.");
                return;
            }

            var blobServiceClient = new BlobServiceClient(connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
            
            if (!await containerClient.ExistsAsync())
            {
                _logger.LogWarning("Container {ContainerName} does not exist.", _containerName);
                return;
            }

            int archivedCount = 0;
            var cutoffDate = DateTimeOffset.UtcNow.AddDays(-30);

            await foreach (var blobItem in containerClient.GetBlobsAsync())
            {
                if (blobItem.Properties.CreatedOn <= cutoffDate && blobItem.Properties.AccessTier != AccessTier.Archive)
                {
                    var blobClient = containerClient.GetBlobClient(blobItem.Name);
                    _logger.LogInformation("Changing Access Tier to Archive for blob: {BlobName}", blobItem.Name);
                    
                    try 
                    {
                        await blobClient.SetAccessTierAsync(AccessTier.Archive);
                        archivedCount++;
                    } 
                    catch (Exception ex) 
                    {
                        _logger.LogError(ex, "Failed to archive blob {BlobName}", blobItem.Name);
                    }
                }
            }

            _logger.LogInformation("Successfully archived {Count} blobs.", archivedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during ArchiveOldBlobs execution");
            throw;
        }

        if (myTimer.ScheduleStatus is not null)
        {
            _logger.LogInformation("Next timer schedule at: {Next}", myTimer.ScheduleStatus.Next);
        }
    }
}
