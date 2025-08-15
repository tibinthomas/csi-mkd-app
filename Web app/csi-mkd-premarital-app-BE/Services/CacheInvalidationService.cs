using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Extensions.Caching.Memory;

namespace csi_mkd_premarital_app_BE.Services;

public class CacheInvalidationService : ICacheInvalidationService
{
    private readonly IOutputCacheStore _outputCacheStore;
    private readonly IMemoryCache _memoryCache;

    public CacheInvalidationService(IOutputCacheStore outputCacheStore, IMemoryCache memoryCache)
    {
        _outputCacheStore = outputCacheStore;
        _memoryCache = memoryCache;
    }

    public async Task InvalidateAllCachesAsync()
    {
        // Invalidate all output cache tags
        await InvalidateCacheByTagAsync("premarital-regs");
        await InvalidateCacheByTagAsync("general-regs");
        await InvalidateCacheByTagAsync("confirmation-regs");
        await InvalidateCacheByTagAsync("sessions");
        await InvalidateCacheByTagAsync("email-config");
        await InvalidateCacheByTagAsync("feedback");
        await InvalidateCacheByTagAsync("feedback-analytics");
        await InvalidateCacheByTagAsync("cosmos-feedback");
        await InvalidateCacheByTagAsync("cosmos-feedback-analytics");

        // Invalidate memory cache entries
        _memoryCache.Remove("email-config-cache");
    }

    public async Task InvalidateRegistrationCachesAsync()
    {
        await InvalidateCacheByTagAsync("premarital-regs");
        await InvalidateCacheByTagAsync("general-regs");
        await InvalidateCacheByTagAsync("confirmation-regs");
    }

    public async Task InvalidateSessionCachesAsync()
    {
        await InvalidateCacheByTagAsync("sessions");
    }

    public async Task InvalidateEmailConfigCachesAsync()
    {
        await InvalidateCacheByTagAsync("email-config");
        _memoryCache.Remove("email-config-cache");
    }

    public async Task InvalidateFeedbackCachesAsync()
    {
        await InvalidateCacheByTagAsync("feedback");
        await InvalidateCacheByTagAsync("feedback-analytics");
        await InvalidateCacheByTagAsync("cosmos-feedback");
        await InvalidateCacheByTagAsync("cosmos-feedback-analytics");
    }

    public async Task InvalidateCacheByTagAsync(string tag)
    {
        try
        {
            await _outputCacheStore.EvictByTagAsync(tag, default);
        }
        catch (Exception ex)
        {
            // Log the error but don't throw to prevent breaking the main operation
            // In a production environment, you might want to use a proper logging framework
            Console.WriteLine($"Failed to invalidate cache tag '{tag}': {ex.Message}");
        }
    }
}
