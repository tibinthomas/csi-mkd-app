using csi_mkd_premarital_app_BE.Data;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Configuration;

public static class StartupConfiguration
{
    public static void ConfigureStartupTasks(WebApplication app)
    {
        // Only warm up in production, skip in development
        if (!app.Environment.IsDevelopment())
        {
            app.Lifetime.ApplicationStarted.Register(() =>
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using var scope = app.Services.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                        
                        // Use a lighter query for warmup
                        await db.Database.CanConnectAsync();
                        
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
}
