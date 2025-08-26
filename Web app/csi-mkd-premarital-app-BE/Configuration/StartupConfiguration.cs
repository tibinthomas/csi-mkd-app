using csi_mkd_premarital_app_BE.Data;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Configuration;

public static class StartupConfiguration
{
    public static void ConfigureStartupTasks(WebApplication app)
    {
        // Database initialization for all environments
        app.Lifetime.ApplicationStarted.Register(() =>
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using var scope = app.Services.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                        var cosmosDb = scope.ServiceProvider.GetRequiredService<CosmosDbContext>();
                        
                        // Use a lighter query for warmup
                        await db.Database.CanConnectAsync();
                        
                        // Ensure Cosmos DB database and containers are created
                        await cosmosDb.Database.EnsureCreatedAsync();
                        
                        // Skip model building warmup in production with compiled models
                    }
                    catch (Exception ex)
                    {
                        // Log but don't fail startup
                        app.Logger.LogWarning(ex, "Database warmup failed, continuing startup");
                    }
                });
            });
    }
}
