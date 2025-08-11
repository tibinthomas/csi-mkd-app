using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace csi_mkd_premarital_app_BE.Services;

public class CacheHealthService : ICacheHealthService, IHostedService, IDisposable
{
    private readonly IMemoryCache _memoryCache;
    private readonly ICacheInvalidationService _cacheInvalidationService;
    private readonly ILogger<CacheHealthService> _logger;
    private Timer? _timer;
    private DateTime _lastMaintenance = DateTime.UtcNow;

    public CacheHealthService(
        IMemoryCache memoryCache,
        ICacheInvalidationService cacheInvalidationService,
        ILogger<CacheHealthService> logger)
    {
        _memoryCache = memoryCache;
        _cacheInvalidationService = cacheInvalidationService;
        _logger = logger;
    }

    public Task<CacheHealthInfo> GetCacheHealthAsync()
    {
        try
        {
            // Get memory cache statistics if possible
            var memoryUsage = GC.GetTotalMemory(false);
            
            var result = new CacheHealthInfo
            {
                LastMaintenance = _lastMaintenance,
                ActiveCacheEntries = GetActiveCacheEntriesCount(),
                MemoryUsageBytes = memoryUsage,
                IsHealthy = true,
                Status = "Healthy"
            };
            
            return Task.FromResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache health information");
            var result = new CacheHealthInfo
            {
                LastMaintenance = _lastMaintenance,
                ActiveCacheEntries = 0,
                MemoryUsageBytes = 0,
                IsHealthy = false,
                Status = $"Error: {ex.Message}"
            };
            
            return Task.FromResult(result);
        }
    }

    public async Task PerformCacheMaintenanceAsync()
    {
        try
        {
            _logger.LogInformation("Starting cache maintenance");
            
            // Clean up expired caches
            await CleanupExpiredCachesAsync();
            
            // Force garbage collection to free up memory
            GC.Collect();
            GC.WaitForPendingFinalizers();
            
            _lastMaintenance = DateTime.UtcNow;
            _logger.LogInformation("Cache maintenance completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cache maintenance");
        }
    }

    public async Task CleanupExpiredCachesAsync()
    {
        try
        {
            // For memory cache, we can't directly enumerate entries
            // But we can trigger a collection to clean up expired entries
            // The memory cache automatically removes expired entries
            
            // For output cache, we could potentially clean up old entries
            // This would require access to the output cache store
            
            _logger.LogDebug("Cache cleanup completed");
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cache cleanup");
        }
    }

    private int GetActiveCacheEntriesCount()
    {
        // This is a simplified approach - in a real scenario you might want to track this differently
        try
        {
            // For memory cache, we can't easily get the count without reflection
            // This is a placeholder implementation
            return 0;
        }
        catch
        {
            return 0;
        }
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Cache Health Service is starting");
        
        // Run maintenance every 30 minutes
        _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromMinutes(30));
        
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Cache Health Service is stopping");
        
        _timer?.Change(Timeout.Infinite, 0);
        
        return Task.CompletedTask;
    }

    private void DoWork(object? state)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                await PerformCacheMaintenanceAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in cache maintenance timer");
            }
        });
    }

    public void Dispose()
    {
        _timer?.Dispose();
    }
}
