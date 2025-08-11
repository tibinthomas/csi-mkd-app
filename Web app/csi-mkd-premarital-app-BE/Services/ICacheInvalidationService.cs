using Microsoft.AspNetCore.OutputCaching;

namespace csi_mkd_premarital_app_BE.Services;

public interface ICacheInvalidationService
{
    /// <summary>
    /// Invalidates all cached data across the application
    /// </summary>
    Task InvalidateAllCachesAsync();
    
    /// <summary>
    /// Invalidates all registration-related caches
    /// </summary>
    Task InvalidateRegistrationCachesAsync();
    
    /// <summary>
    /// Invalidates session configuration caches
    /// </summary>
    Task InvalidateSessionCachesAsync();
    
    /// <summary>
    /// Invalidates email configuration caches
    /// </summary>
    Task InvalidateEmailConfigCachesAsync();
    
    /// <summary>
    /// Invalidates feedback caches
    /// </summary>
    Task InvalidateFeedbackCachesAsync();
    
    /// <summary>
    /// Invalidates specific cache tag
    /// </summary>
    Task InvalidateCacheByTagAsync(string tag);
}
