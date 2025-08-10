using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;
using csi_mkd_premarital_app_BE.Utilities;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class EmailConfigEndpoints
{
    public static void MapEmailConfigEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/emailconfig");

        group.MapGet("/", async (ApplicationDbContext db, HttpRequest req) =>
        {
            var config = await db.EmailConfigs.AsNoTracking().FirstOrDefaultAsync();
            if (config == null) return Results.NotFound();
            var version = $"{config.SenderEmail}:{config.EmailSubject}:{(config.EmailBodyTemplate?.Length ?? 0)}";
            var etag = ETagHelper.GenerateETag(version);
            if (req.Headers["If-None-Match"] == etag)
                return Results.StatusCode(304);
            req.HttpContext.Response.Headers["ETag"] = etag;
            return Results.Ok(config);
        }).CacheOutput(p => p.Tag("email-config").Expire(TimeSpan.FromMinutes(2)));

        group.MapPost("/", async (ApplicationDbContext db, IOutputCacheStore cache, EmailConfig input) =>
        {
            var existing = await db.EmailConfigs.FirstOrDefaultAsync();
            if (existing != null)
            {
                existing.SenderEmail = input.SenderEmail;
                existing.SenderPassword = input.SenderPassword;
                existing.EmailSubject = input.EmailSubject;
                existing.EmailBodyTemplate = input.EmailBodyTemplate;
            }
            else
            {
                db.EmailConfigs.Add(input);
            }

            await db.SaveChangesAsync();
            await cache.EvictByTagAsync("email-config", default);
            return Results.Ok("Email config saved successfully.");
        });
    }
}


