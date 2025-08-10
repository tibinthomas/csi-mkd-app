using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class EmailConfigEndpoints
{
    public static void MapEmailConfigEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/emailconfig");

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var config = await db.EmailConfigs.AsNoTracking().FirstOrDefaultAsync();
            if (config == null) return Results.NotFound();
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


