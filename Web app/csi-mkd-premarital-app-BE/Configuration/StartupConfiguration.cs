using csi_mkd_premarital_app_BE.Data;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Configuration;

public static class StartupConfiguration
{
    public static void ConfigureStartupTasks(WebApplication app)
    {
        // Warm up EF Core model and database connection in the background after startup
        app.Lifetime.ApplicationStarted.Register(() =>
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = app.Services.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    
                    await db.Database.CanConnectAsync();
                    
                    // Execute a very light query to force model build
                    await db.AdminUsers
                        .AsNoTracking()
                        .Select(x => x.Id)
                        .OrderBy(x => x)
                        .Take(1)
                        .ToListAsync();
                }
                catch (Exception ex)
                {
                    try
                    {
                        app.Logger.LogError(ex, "Warmup: database connectivity or model build failed");
                    }
                    catch
                    {
                        // Ignore logging failure
                    }
                }
            });
        });
    }
}
