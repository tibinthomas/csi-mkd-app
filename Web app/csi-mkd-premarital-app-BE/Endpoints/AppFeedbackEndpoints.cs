using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace csi_mkd_premarital_app_BE.Endpoints
{
    public static class AppFeedbackEndpoints
    {
        // Anonymous endpoint: keep submissions per IP low to prevent spam floods.
        private const int MaxSubmissionsPerWindow = 5;
        private static readonly TimeSpan SubmissionWindow = TimeSpan.FromHours(1);

        // Cap the admin list; app feedback volume is low and the page shows everything.
        private const int MaxListSize = 500;

        public static void MapAppFeedbackEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/appfeedback");
            group.DisableAntiforgery();
            // Reads are admin-only; anonymous users may only submit.
            group.RequireAuthorization();

            // Submit feedback about the app (public)
            group.MapPost("/", async (
                CosmosDbContext db,
                ICacheInvalidationService cacheService,
                IMemoryCache memoryCache,
                AppFeedbackDto dto,
                HttpContext context) =>
            {
                if (dto.Rating is < 1 or > 5)
                    return Results.BadRequest(new { message = "Rating must be between 1 and 5." });

                // Fixed-window throttle per client IP
                var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                var throttleKey = $"app-feedback-submit:{ip}";
                var count = memoryCache.GetOrCreate(throttleKey, entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow = SubmissionWindow;
                    return 0;
                });
                if (count >= MaxSubmissionsPerWindow)
                    return Results.StatusCode(StatusCodes.Status429TooManyRequests);
                memoryCache.Set(throttleKey, count + 1, SubmissionWindow);

                static string? Clean(string? value, int max)
                {
                    if (string.IsNullOrWhiteSpace(value))
                        return null;
                    var trimmed = value.Trim();
                    return trimmed[..Math.Min(trimmed.Length, max)];
                }

                var feedback = new AppFeedback
                {
                    Id = Guid.NewGuid(),
                    Rating = dto.Rating,
                    LikedMost = Clean(dto.LikedMost, 2000),
                    Improvements = Clean(dto.Improvements, 2000),
                    Page = Clean(dto.Page, 300),
                    Locale = Clean(dto.Locale, 10),
                    UserAgent = Clean(context.Request.Headers.UserAgent.ToString(), 500),
                    CreatedAt = DateTime.UtcNow,
                };

                db.AppFeedbacks.Add(feedback);
                await db.SaveChangesAsync();

                // Make the new entry visible to admins immediately
                await cacheService.InvalidateCacheByTagAsync("app-feedback");

                return Results.Ok(new { message = "Thank you for your feedback." });
            })
            .AllowAnonymous()
            .Accepts<AppFeedbackDto>("application/json")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status429TooManyRequests)
            .WithName("SubmitAppFeedback")
            .WithSummary("Submit feedback about the web application (rating and comments)");

            // List app feedback, newest first (admin only)
            group.MapGet("/", async (CosmosDbContext db) =>
            {
                var items = await db.AppFeedbacks
                    .AsNoTracking()
                    .OrderByDescending(f => f.CreatedAt)
                    .Take(MaxListSize)
                    .Select(f => new AppFeedbackResponseDto
                    {
                        Id = f.Id,
                        Rating = f.Rating,
                        LikedMost = f.LikedMost,
                        Improvements = f.Improvements,
                        Page = f.Page,
                        Locale = f.Locale,
                        CreatedAt = f.CreatedAt,
                    })
                    .ToListAsync();

                return Results.Ok(items);
            })
            .Produces<List<AppFeedbackResponseDto>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("app-feedback").Expire(TimeSpan.FromMinutes(2)))
            .WithName("GetAppFeedback")
            .WithSummary("List feedback submitted about the web application (admin)");
        }
    }
}
