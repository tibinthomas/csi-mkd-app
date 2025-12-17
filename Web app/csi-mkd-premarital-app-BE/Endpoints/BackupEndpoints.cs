using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Http;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class BackupEndpoints
{
    public static void MapBackupEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/backup");
        group.DisableAntiforgery();

        // POST /api/backup/trigger - Manually trigger a backup
        group.MapPost("/trigger", async (IBackupService service, ILogger<Program> logger) =>
        {
            try
            {
                logger.LogInformation("Manual backup triggered via API");
                var backupFileName = await service.TriggerBackupAsync();
                
                return Results.Ok(new
                {
                    success = true,
                    message = "Backup completed successfully",
                    backupFileName,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during manual backup");
                return Results.Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Backup failed"
                );
            }
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status500InternalServerError)
        .WithName("TriggerBackup")
        .WithTags("Backup")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Manually trigger database backup";
            operation.Description = "Triggers an immediate backup of the Supabase database to Azure Blob Storage";
            return operation;
        });

        // GET /api/backup/download/latest - Download the most recent backup
        group.MapGet("/download/latest", async (IBackupService service, ILogger<Program> logger) =>
        {
            try
            {
                logger.LogInformation("Download latest backup requested via API");
                var result = await service.DownloadLatestBackupAsync();
                
                if (result == null)
                {
                    return Results.NotFound(new
                    {
                        success = false,
                        message = "No backups available"
                    });
                }

                var (stream, filename) = result.Value;
                
                return Results.Stream(
                    stream,
                    contentType: "application/octet-stream",
                    fileDownloadName: filename
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occurred during backup download");
                return Results.Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "Download failed"
                );
            }
        })
        .Produces(StatusCodes.Status200OK, contentType: "application/octet-stream")
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status500InternalServerError)
        .WithName("DownloadLatestBackup")
        .WithTags("Backup")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Download latest backup";
            operation.Description = "Downloads the most recent backup file from Azure Blob Storage";
            return operation;
        });
    }
}
