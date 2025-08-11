using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Antiforgery;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class CacheManagementEndpoints
{
    public static void MapCacheManagementEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/cache");
        group.DisableAntiforgery();

        // Invalidate all caches
        group.MapPost("/invalidate-all", [Authorize] async (ICacheInvalidationService cacheService) =>
        {
            await cacheService.InvalidateAllCachesAsync();
            return Results.Ok(new { message = "All caches invalidated successfully." });
        });

        // Invalidate registration caches
        group.MapPost("/invalidate-registrations", [Authorize] async (ICacheInvalidationService cacheService) =>
        {
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Ok(new { message = "Registration caches invalidated successfully." });
        });

        // Invalidate session caches
        group.MapPost("/invalidate-sessions", [Authorize] async (ICacheInvalidationService cacheService) =>
        {
            await cacheService.InvalidateSessionCachesAsync();
            return Results.Ok(new { message = "Session caches invalidated successfully." });
        });

        // Invalidate email config caches
        group.MapPost("/invalidate-email-config", [Authorize] async (ICacheInvalidationService cacheService) =>
        {
            await cacheService.InvalidateEmailConfigCachesAsync();
            return Results.Ok(new { message = "Email configuration caches invalidated successfully." });
        });

        // Invalidate feedback caches
        group.MapPost("/invalidate-feedback", [Authorize] async (ICacheInvalidationService cacheService) =>
        {
            await cacheService.InvalidateFeedbackCachesAsync();
            return Results.Ok(new { message = "Feedback caches invalidated successfully." });
        });

        // Invalidate specific cache tag
        group.MapPost("/invalidate-tag/{tag}", [Authorize] async (string tag, ICacheInvalidationService cacheService) =>
        {
            await cacheService.InvalidateCacheByTagAsync(tag);
            return Results.Ok(new { message = $"Cache tag '{tag}' invalidated successfully." });
        });

        // Get cache health information
        group.MapGet("/health", [Authorize] async (ICacheHealthService healthService) =>
        {
            var health = await healthService.GetCacheHealthAsync();
            return Results.Ok(health);
        });

        // Trigger manual cache maintenance
        group.MapPost("/maintenance", [Authorize] async (ICacheHealthService healthService) =>
        {
            await healthService.PerformCacheMaintenanceAsync();
            return Results.Ok(new { message = "Cache maintenance completed successfully." });
        });
    }
}
