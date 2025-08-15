using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Endpoints;

namespace csi_mkd_premarital_app_BE.Configuration;

public static class EndpointConfiguration
{
    public static void MapEndpoints(WebApplication app)
    {
        // Default endpoints
        app.MapDefaultEndpoints();

        // Health check endpoints
        MapHealthEndpoints(app);

        // Application endpoints
        app.MapAuthEndpoints();
        app.MapGeneralRegisterEndpoints();
        app.MapPremaritalRegisterEndpoints();
        app.MapConfirmationRegisterEndpoints();
        app.MapSessionConfigEndpoints();
        app.MapEmailConfigEndpoints();
        app.MapCosmosDbFeedbackEndpoints();
        app.MapAzureUploadEndpoints();
        app.MapCacheManagementEndpoints();
    }

    private static void MapHealthEndpoints(WebApplication app)
    {
        app.MapGet("/health", () => Results.Ok("Healthy"));

        app.MapGet("/health/db", async (ApplicationDbContext db) =>
        {
            try
            {
                var canConnect = await db.Database.CanConnectAsync();
                return canConnect ? Results.Ok("DB OK") : Results.Problem("DB not reachable");
            }
            catch (Exception ex)
            {
                return Results.Problem($"DB check failed: {ex.Message}");
            }
        });

        app.MapGet("/health/cosmos", async (CosmosDbContext cosmosDb) =>
        {
            try
            {
                // Test Cosmos DB connection by trying to ensure database exists
                await cosmosDb.Database.EnsureCreatedAsync();
                return Results.Ok("Cosmos DB OK");
            }
            catch (Exception ex)
            {
                return Results.Problem($"Cosmos DB check failed: {ex.Message}");
            }
        });
    }
}
