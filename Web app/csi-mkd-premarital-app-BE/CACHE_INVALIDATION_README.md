# Cache Invalidation System

This document describes the comprehensive cache invalidation system implemented in the CSI MKD Premarital Application.

## Overview

The application uses two types of caching:
1. **Output Caching** - For API responses using ASP.NET Core's built-in output caching
2. **Memory Caching** - For internal service data (e.g., email configuration)

## Architecture

### Core Components

#### 1. ICacheInvalidationService
Central interface for all cache invalidation operations:
- `InvalidateAllCachesAsync()` - Invalidates all caches
- `InvalidateRegistrationCachesAsync()` - Invalidates registration-related caches
- `InvalidateSessionCachesAsync()` - Invalidates session configuration caches
- `InvalidateEmailConfigCachesAsync()` - Invalidates email configuration caches
- `InvalidateFeedbackCachesAsync()` - Invalidates feedback caches
- `InvalidateCacheByTagAsync(string tag)` - Invalidates specific cache tag

#### 2. CacheInvalidationService
Implementation of the cache invalidation service that handles both output caching and memory caching.

#### 3. CacheHealthService
Background service that monitors cache health and performs periodic maintenance:
- Runs every 30 minutes
- Cleans up expired cache entries
- Monitors memory usage
- Provides health statistics

#### 4. CacheInvalidationMiddleware
HTTP middleware that can automatically invalidate caches based on request headers:
- `X-Cache-Invalidate: all` - Invalidates all caches
- `X-Cache-Invalidate: registrations` - Invalidates registration caches
- `X-Cache-Invalidate: sessions` - Invalidates session caches
- `X-Cache-Invalidate: email-config` - Invalidates email config caches
- `X-Cache-Invalidate: feedback` - Invalidates feedback caches

## Cache Tags

The application uses the following cache tags:

| Tag | Description | Expiration |
|-----|-------------|------------|
| `premarital-regs` | Premarital registration data | 10 seconds |
| `general-regs` | General registration data | 10 seconds |
| `confirmation-regs` | Confirmation registration data | 10 seconds |
| `sessions` | Session configuration data | 2 minutes |
| `email-config` | Email configuration | 2 minutes |
| `feedback` | Session feedback data | 2 minutes |

## Automatic Cache Invalidation

Caches are automatically invalidated when:

### Registration Operations
- Creating new registrations
- Updating registration files
- Updating payment status

### Session Operations
- Creating new sessions
- Updating session configurations
- Deleting sessions

### Configuration Operations
- Updating email configuration
- Submitting feedback

## Manual Cache Management

### API Endpoints

All cache management endpoints require authentication (`[Authorize]`):

```
POST /api/cache/invalidate-all          - Invalidate all caches
POST /api/cache/invalidate-registrations - Invalidate registration caches
POST /api/cache/invalidate-sessions     - Invalidate session caches
POST /api/cache/invalidate-email-config - Invalidate email config caches
POST /api/cache/invalidate-feedback     - Invalidate feedback caches
POST /api/cache/invalidate-tag/{tag}    - Invalidate specific cache tag
GET  /api/cache/health                  - Get cache health information
POST /api/cache/maintenance             - Trigger manual cache maintenance
```

### HTTP Headers

You can also invalidate caches using HTTP headers:

```http
X-Cache-Invalidate: all
X-Cache-Invalidate: registrations
X-Cache-Invalidate: sessions
X-Cache-Invalidate: email-config
X-Cache-Invalidate: feedback
```

## Implementation Details

### Service Registration

```csharp
// In Program.cs
builder.Services.AddScoped<ICacheInvalidationService, CacheInvalidationService>();
builder.Services.AddSingleton<ICacheHealthService, CacheHealthService>();
```

### Middleware Registration

```csharp
// In Program.cs
app.UseCacheInvalidation();
```

### Endpoint Registration

```csharp
// In Program.cs
app.MapCacheManagementEndpoints();
```

## Error Handling

The cache invalidation system includes comprehensive error handling:

1. **Graceful Degradation** - Cache invalidation failures don't break main operations
2. **Logging** - All errors are logged for debugging
3. **Fallback** - Services continue to work even if cache invalidation fails

## Best Practices

### When to Invalidate Caches

1. **Data Changes** - Always invalidate caches when data is modified
2. **Configuration Updates** - Invalidate caches when settings change
3. **Bulk Operations** - Consider invalidating all caches for major data imports

### Performance Considerations

1. **Selective Invalidation** - Use specific cache tags instead of invalidating all caches
2. **Batch Operations** - Group cache invalidations when possible
3. **Background Processing** - Use the health service for periodic maintenance

### Monitoring

1. **Health Checks** - Use `/api/cache/health` to monitor cache status
2. **Logs** - Monitor logs for cache invalidation errors
3. **Memory Usage** - Watch memory consumption patterns

## Troubleshooting

### Common Issues

1. **Cache Not Invalidating**
   - Check if the service is properly registered
   - Verify cache tags are correct
   - Check authentication requirements

2. **Memory Leaks**
   - Monitor memory usage via health endpoint
   - Check for circular references in cached objects
   - Verify expiration policies are set correctly

3. **Performance Issues**
   - Review cache expiration times
   - Check if too many caches are being invalidated
   - Monitor background maintenance frequency

### Debug Commands

```bash
# Check cache health
curl -H "Authorization: Bearer {token}" https://api.example.com/api/cache/health

# Invalidate all caches
curl -X POST -H "Authorization: Bearer {token}" https://api.example.com/api/cache/invalidate-all

# Force cache maintenance
curl -X POST -H "Authorization: Bearer {token}" https://api.example.com/api/cache/maintenance
```

## Future Enhancements

1. **Redis Support** - Add distributed caching capabilities
2. **Cache Warming** - Pre-populate frequently accessed data
3. **Advanced Policies** - Implement more sophisticated cache invalidation rules
4. **Metrics Dashboard** - Real-time cache performance monitoring
5. **Predictive Invalidation** - AI-powered cache invalidation timing

## Security Considerations

1. **Authentication Required** - All cache management endpoints require admin authentication
2. **Rate Limiting** - Cache invalidation is subject to rate limiting
3. **Audit Logging** - All cache operations are logged for security purposes
4. **Input Validation** - Cache tags are validated before processing

## Conclusion

This cache invalidation system provides a robust, scalable solution for managing cached data across the application. It ensures data consistency while maintaining performance and provides administrators with comprehensive control over cache operations.
