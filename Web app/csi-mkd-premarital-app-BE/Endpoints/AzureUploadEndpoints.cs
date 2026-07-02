using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class AzureUploadEndpoints
{
    public static void MapAzureUploadEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/azureupload");
        group.DisableAntiforgery();
        // Secure by default: SAS generation stays public (all registration flows
        // upload files with it); rehydration is admin-only.
        group.RequireAuthorization();

        group.MapGet("/generate-sas", async (BlobStorageService blobService, string fileName, string contentType) =>
        {
            var url = await blobService.GetUploadSasUrlAsync(fileName, contentType);
            return Results.Ok(new { url });
        })
        .AllowAnonymous()
        .Produces(StatusCodes.Status200OK);

        group.MapPost("/rehydrate", async (BlobStorageService blobService, RehydrateRequest request) =>
        {
            if (string.IsNullOrWhiteSpace(request.BlobUrl))
                return Results.BadRequest(new { status = "invalid_request" });

            var status = await blobService.RehydrateBlobAsync(request.BlobUrl);
            return Results.Ok(new { status });
        })
        .Produces(StatusCodes.Status200OK);
    }
}

internal record RehydrateRequest(string BlobUrl);


