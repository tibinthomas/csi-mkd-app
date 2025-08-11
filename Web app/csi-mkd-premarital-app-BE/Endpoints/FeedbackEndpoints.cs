using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class FeedbackEndpoints
{
    public static void MapFeedbackEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/feedback");
        group.DisableAntiforgery();

        group.MapPost("/", async (ApplicationDbContext db, ICacheInvalidationService cacheService, SessionFeedbackDto dto) =>
        {
            var feedback = new SessionFeedback
            {
                SessionTitle = dto.SessionTitle,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
                QualityRating = dto.QualityRating,
                RelevanceRating = dto.RelevanceRating,
                EngagementRating = dto.EngagementRating,
                OrganizationRating = dto.OrganizationRating,
                Valuable = dto.Valuable,
                Improvements = dto.Improvements,
                Comments = dto.Comments
            };

            db.SessionFeedbacks.Add(feedback);
            await db.SaveChangesAsync();
            await cacheService.InvalidateFeedbackCachesAsync();
            return Results.Ok(new { message = "Feedback submitted successfully." });
        });

        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var allFeedbacks = await db.SessionFeedbacks
                .AsNoTracking()
                .OrderByDescending(f => f.SubmittedAt)
                .ToListAsync();
            return Results.Ok(allFeedbacks);
        }).CacheOutput(p => p.Tag("feedback").Expire(TimeSpan.FromMinutes(2)));
    }
}


