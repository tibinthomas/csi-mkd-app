using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CsiMkdFunctions.Data;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CsiMkdFunctions;

public class ArchiveOldBlobsFunction
{
    private readonly ILogger<ArchiveOldBlobsFunction> _logger;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;
    private readonly string _containerName = "register-documents";

    public ArchiveOldBlobsFunction(
        ILogger<ArchiveOldBlobsFunction> logger,
        IConfiguration configuration,
        ApplicationDbContext context)
    {
        _logger = logger;
        _configuration = configuration;
        _context = context;
    }

    [Function("ArchiveOldBlobs")]
    public async Task Run([TimerTrigger("0 0 0 1 * *")] TimerInfo myTimer)
    {
        _logger.LogInformation("ArchiveOldBlobs function triggered at: {Time}", DateTime.UtcNow);

        try
        {
            var blobConnectionString = _configuration["AzureBlob:ConnectionString"];
            if (string.IsNullOrEmpty(blobConnectionString))
            {
                _logger.LogError("AzureBlob:ConnectionString is missing in configuration.");
                return;
            }

            var blobNamesToArchive = await GetBlobNamesFromPastSessionsAsync();
            _logger.LogInformation("Found {Count} blob(s) eligible for archival based on session dates.", blobNamesToArchive.Count);

            var blobServiceClient = new BlobServiceClient(blobConnectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);

            if (!await containerClient.ExistsAsync())
            {
                _logger.LogWarning("Container {ContainerName} does not exist.", _containerName);
                return;
            }

            int archivedCount = 0;

            await foreach (var blobItem in containerClient.GetBlobsAsync())
            {
                if (blobNamesToArchive.Contains(blobItem.Name) && blobItem.Properties.AccessTier != AccessTier.Archive)
                {
                    var blobClient = containerClient.GetBlobClient(blobItem.Name);
                    _logger.LogInformation("Archiving blob: {BlobName}", blobItem.Name);

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

    private async Task<HashSet<string>> GetBlobNamesFromPastSessionsAsync()
    {
        var cutoff = DateTime.UtcNow.AddMonths(-2);
        var cutoffOffset = DateTimeOffset.UtcNow.AddMonths(-2);
        var blobNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // Premarital session documents — archive 2 months after session EndDate
        var premaritalUrls = await _context.PremaritalDocuments
            .AsNoTracking()
            .Where(pd => pd.PremaritalRegistration!.SessionConfiguration!.EndDate < cutoff)
            .Select(pd => new { pd.PhotoUrl, pd.VicarLetterUrl })
            .ToListAsync();

        foreach (var doc in premaritalUrls)
        {
            AddBlobName(blobNames, doc.PhotoUrl);
            AddBlobName(blobNames, doc.VicarLetterUrl);
        }

        // Outside-Kerala premarital documents — archive 2 months after SessionEndDate
        var outsideKeralaUrls = await _context.PremaritalOutsideKeralaDocuments
            .AsNoTracking()
            .Where(pd => pd.PremaritalOutsideKeralaRegistration!.SessionEndDate < cutoffOffset)
            .Select(pd => pd.VicarLetterUrl)
            .ToListAsync();

        foreach (var url in outsideKeralaUrls)
            AddBlobName(blobNames, url);

        return blobNames;
    }

    private void AddBlobName(HashSet<string> set, string? url)
    {
        if (string.IsNullOrEmpty(url)) return;
        var containerSegment = $"/{_containerName}/";
        var idx = url.IndexOf(containerSegment, StringComparison.OrdinalIgnoreCase);
        if (idx >= 0)
        {
            var name = Uri.UnescapeDataString(url[(idx + containerSegment.Length)..].Split('?')[0]);
            if (!string.IsNullOrEmpty(name))
                set.Add(name);
        }
    }
}
