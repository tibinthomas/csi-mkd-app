using csi_mkd_premarital_app_BE.Middleware;

namespace csi_mkd_premarital_app_BE.Configuration;

public static class MiddlewareConfiguration
{
    public static void ConfigureMiddleware(WebApplication app)
    {
        // Development-specific middleware
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "CSI MKD API V1");
                c.RoutePrefix = "swagger";
            });
            app.UseHttpsRedirection();
        }

        // Custom middleware
        app.UseMiddleware<RateLimitingMiddleware>();
        app.UseIpRateLimiting();
        app.UseClientRateLimiting();

        // Standard middleware
        app.UseStaticFiles();
        app.UseCors("AllowedOrigins");
        app.UseOutputCache();
        app.UseCacheInvalidation();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseAntiforgery();
    }
}
