using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class EmailConfigEndpoints
{
    public static void MapEmailConfigEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/emailconfig");
        group.DisableAntiforgery();
        // Admin-only: the config includes sender credentials and must never be public.
        group.RequireAuthorization();

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var config = await db.EmailConfigs.AsNoTracking().FirstOrDefaultAsync();
            if (config == null) return Results.NotFound();
            return Results.Ok(config);
        })
        .Produces<EmailConfig>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .CacheOutput(p => p.Tag("email-config").Expire(TimeSpan.FromMinutes(2)));

        group.MapPost("/", async (ApplicationDbContext db, ICacheInvalidationService cacheService, EmailConfig input) =>
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
            await cacheService.InvalidateEmailConfigCachesAsync();
            return Results.Ok("Email config saved successfully.");
        })
        .Accepts<EmailConfig>("application/json")
        .Produces(StatusCodes.Status200OK);
    }
}


