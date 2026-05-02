namespace csi_mkd_premarital_app_BE.Services;

public interface ICacheHealthService
{
    /// <summary>
    /// Gets the current cache statistics
    /// </summary>
    Task<CacheHealthInfo> GetCacheHealthAsync();
    
    /// <summary>
    /// Performs cache maintenance operations
    /// </summary>
    Task PerformCacheMaintenanceAsync();
    
    /// <summary>
    /// Cleans up expired cache entries
    /// </summary>
    Task CleanupExpiredCachesAsync();
}

public class CacheHealthInfo
{
    public DateTime LastMaintenance { get; set; }
    public int ActiveCacheEntries { get; set; }
    public long MemoryUsageBytes { get; set; }
    public bool IsHealthy { get; set; }
    public string Status { get; set; } = string.Empty;
}
