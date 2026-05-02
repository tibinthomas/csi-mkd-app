using csi_mkd_premarital_app_BE.Services;

namespace csi_mkd_premarital_app_BE.Middleware;

public class CacheInvalidationMiddleware
{
    private readonly RequestDelegate _next;

    public CacheInvalidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check if this is a cache invalidation request
        if (context.Request.Headers.ContainsKey("X-Cache-Invalidate"))
        {
            var invalidateHeader = context.Request.Headers["X-Cache-Invalidate"].ToString();
            
            // Get the cache service from the request scope
            var cacheService = context.RequestServices.GetService<ICacheInvalidationService>();
            
            if (cacheService != null)
            {
                switch (invalidateHeader.ToLower())
                {
                    case "all":
                        await cacheService.InvalidateAllCachesAsync();
                        break;
                    case "registrations":
                        await cacheService.InvalidateRegistrationCachesAsync();
                        break;
                    case "sessions":
                        await cacheService.InvalidateSessionCachesAsync();
                        break;
                    case "email-config":
                        await cacheService.InvalidateEmailConfigCachesAsync();
                        break;
                    case "feedback":
                        await cacheService.InvalidateFeedbackCachesAsync();
                        break;
                    default:
                        // If it's a specific tag, invalidate by tag
                        if (!string.IsNullOrEmpty(invalidateHeader))
                        {
                            await cacheService.InvalidateCacheByTagAsync(invalidateHeader);
                        }
                        break;
                }
            }
        }

        // Continue with the request pipeline
        await _next(context);
    }
}

// Extension method for easy registration
public static class CacheInvalidationMiddlewareExtensions
{
    public static IApplicationBuilder UseCacheInvalidation(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<CacheInvalidationMiddleware>();
    }
}
