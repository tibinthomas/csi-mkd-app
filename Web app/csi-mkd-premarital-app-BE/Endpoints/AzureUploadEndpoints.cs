using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Antiforgery;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class AzureUploadEndpoints
{
    public static void MapAzureUploadEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/azureupload");
        group.DisableAntiforgery();

        group.MapGet("/generate-sas", async (BlobStorageService blobService, string fileName, string contentType) =>
        {
            var url = await blobService.GetUploadSasUrlAsync(fileName, contentType);
            return Results.Ok(new { url });
        });
    }
}


