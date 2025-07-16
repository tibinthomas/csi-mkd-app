using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;

public class BlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName = "premarital-files";
    private readonly string _accountName;
    private readonly string _accountKey;
    private readonly bool _isDevelopment;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureBlob:ConnectionString"] ?? throw new InvalidOperationException("AzureBlob:ConnectionString is missing in configuration.");
        _accountName = configuration["AzureBlob:AccountName"] ?? throw new InvalidOperationException("AzureBlob:AccountName is missing.");
        _accountKey = configuration["AzureBlob:AccountKey"] ?? throw new InvalidOperationException("AzureBlob:AccountKey is missing.");
        _isDevelopment = connectionString == "UseDevelopmentStorage=true";

        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> GetUploadSasUrlAsync(string fileName, string contentType)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync();

        var blobClient = containerClient.GetBlobClient(fileName);

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _containerName,
            BlobName = fileName,
            Resource = "b",
            StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5),
            ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(30)
        };

        sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

        var credential = new StorageSharedKeyCredential(_accountName, _accountKey);
        var sasToken = sasBuilder.ToSasQueryParameters(credential).ToString();

        // Azurite requires http, not https
        var blobUri = _isDevelopment
            ? new Uri($"http://127.0.0.1:10000/{_accountName}/{_containerName}/{fileName}")
            : blobClient.Uri;

        return $"{blobUri}?{sasToken}";
    }
}



// using Azure.Storage;
// using Azure.Storage.Blobs;
// using Azure.Storage.Sas;
// using Microsoft.Extensions.Configuration;

// public class BlobStorageService
// {
//     private readonly BlobServiceClient _blobServiceClient;
//     private readonly IConfiguration _configuration;
//     private readonly string _containerName = "premarital-files";

//     public BlobStorageService(IConfiguration configuration)
//     {
//         _configuration = configuration;
//         _blobServiceClient = new BlobServiceClient(_configuration["AzureBlob:ConnectionString"]);
//     }

//     public async Task<string> GetUploadSasUrlAsync(string fileName, string contentType)
//     {
//         var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
//         await containerClient.CreateIfNotExistsAsync();

//         var blobClient = containerClient.GetBlobClient(fileName);

//         var sasBuilder = new BlobSasBuilder
//         {
//             BlobContainerName = _containerName,
//             BlobName = fileName,
//             Resource = "b",
//             StartsOn = DateTimeOffset.UtcNow,
//             ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(10)
//         };

//         sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

//         var sasToken = sasBuilder.ToSasQueryParameters(
//             new StorageSharedKeyCredential(
//                 _configuration["AzureBlob:AccountName"],
//                 _configuration["AzureBlob:AccountKey"]
//             )
//         ).ToString();

//         return $"{blobClient.Uri}?{sasToken}";
//     }
// }
