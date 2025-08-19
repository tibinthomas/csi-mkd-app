using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Mvc;

namespace csi_mkd_premarital_app_BE.Endpoints
{
    public static class CosmosDbFeedbackEndpoints
    {
        public static void MapCosmosDbFeedbackEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/cosmos/feedback");
            group.DisableAntiforgery();

            // Submit feedback to Cosmos DB
            group.MapPost("/", async (
                ICosmosDbFeedbackService service,
                FeedbackDocumentDto dto,
                HttpContext context) =>
            {
                var userAgent = context.Request.Headers.UserAgent.ToString();
                var ipAddress = context.Connection.RemoteIpAddress?.ToString();

                await service.SubmitFeedbackAsync(dto, userAgent, ipAddress);
                return Results.Ok(new { message = "Feedback submitted successfully to Cosmos DB." });
            })
            .Accepts<FeedbackDocumentDto>("application/json")
            .Produces(StatusCodes.Status200OK);

            // Get all feedback
            group.MapGet("/", async (ICosmosDbFeedbackService service) =>
            {
                var feedbacks = await service.GetAllFeedbacksAsync();
                return Results.Ok(feedbacks);
            })
            .Produces<List<FeedbackResponseDto>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("cosmos-feedback").Expire(TimeSpan.FromMinutes(2)));

            // Get feedback by date range
            group.MapGet("/date-range", async (
                ICosmosDbFeedbackService service,
                [FromQuery] DateTime startDate,
                [FromQuery] DateTime endDate) =>
            {
                var feedbacks = await service.GetFeedbacksByDateRangeAsync(startDate, endDate);
                return Results.Ok(feedbacks);
            })
            .Produces<List<FeedbackResponseDto>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("cosmos-feedback").Expire(TimeSpan.FromMinutes(5)));

            // Get feedback by registration ID
            group.MapGet("/registration/{registrationId:guid}", async (
                ICosmosDbFeedbackService service,
                Guid registrationId) =>
            {
                var feedbacks = await service.GetFeedbacksByRegistrationIdAsync(registrationId);
                return Results.Ok(feedbacks);
            })
            .Produces<List<FeedbackResponseDto>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("cosmos-feedback").Expire(TimeSpan.FromMinutes(2)));

            // Get completed class IDs for a registration
            group.MapGet("/completed/{registrationId:guid}", async (
                ICosmosDbFeedbackService service,
                Guid registrationId) =>
            {
                var classIds = await service.GetCompletedClassIdsAsync(registrationId);
                return Results.Ok(classIds);
            })
            .Produces<List<int>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("cosmos-feedback").Expire(TimeSpan.FromMinutes(10)));

            // Get feedback by specific ID
            group.MapGet("/{id}/{partitionKey}", async (
                ICosmosDbFeedbackService service,
                string id,
                string partitionKey) =>
            {
                var feedback = await service.GetFeedbackByIdAsync(id, partitionKey);
                if (feedback == null)
                    return Results.NotFound();

                return Results.Ok(feedback);
            })
            .Produces<FeedbackResponseDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

            // Get feedback by class ID
            group.MapGet("/class/{classId:int}", async (
                ICosmosDbFeedbackService service,
                int classId) =>
            {
                var feedbacks = await service.GetFeedbacksByClassIdAsync(classId);
                return Results.Ok(feedbacks);
            })
            .Produces<List<FeedbackResponseDto>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("cosmos-feedback").Expire(TimeSpan.FromMinutes(5)));

            // Get feedback analytics
            group.MapGet("/analytics", async (ICosmosDbFeedbackService service) =>
            {
                var analytics = await service.GetFeedbackAnalyticsAsync();
                return Results.Ok(analytics);
            })
            .Produces<FeedbackAnalyticsDto>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("cosmos-feedback-analytics").Expire(TimeSpan.FromMinutes(10)));

            // Get recent feedback
            group.MapGet("/recent", async (
                ICosmosDbFeedbackService service,
                [FromQuery] int count = 10) =>
            {
                var feedbacks = await service.GetRecentFeedbackAsync(count);
                return Results.Ok(feedbacks);
            })
            .Produces<List<FeedbackResponseDto>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("cosmos-feedback").Expire(TimeSpan.FromMinutes(2)));
        }
    }
}