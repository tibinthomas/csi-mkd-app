using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Services;

namespace csi_mkd_premarital_app_BE.Endpoints
{
    public static class FeedbackEndpoints
    {
        public static void MapFeedbackEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/feedback");
            group.DisableAntiforgery();

            // Submit feedback (maintain exact same endpoint, now uses Cosmos DB behind the scenes)
            group.MapPost("/", async (
                ICosmosDbFeedbackService service, 
                ClassFeedbackDto dto,
                HttpContext context) =>
            {
                var userAgent = context.Request.Headers.UserAgent.ToString();
                var ipAddress = context.Connection.RemoteIpAddress?.ToString();
                
                var feedbackDocumentDto = new FeedbackDocumentDto
                {
                    ClassId = dto.ClassId,
                    Date = dto.Date,
                    QualityRating = dto.QualityRating,
                    RelevanceRating = dto.RelevanceRating,
                    EngagementRating = dto.EngagementRating,
                    OrganizationRating = dto.OrganizationRating,
                    Valuable = dto.Valuable,
                    Improvements = dto.Improvements,
                    Comments = dto.Comments,
                    PremaritalRegistrationId = dto.PremaritalRegistrationId ?? 0,
                    Source = "web",
                    Platform = "api"
                };

                await service.SubmitFeedbackAsync(feedbackDocumentDto, userAgent, ipAddress);
                return Results.Ok(new { message = "Feedback submitted successfully." });
            })
            .Accepts<ClassFeedbackDto>("application/json")
            .Produces(StatusCodes.Status200OK);

            // Get all feedback (maintain exact same endpoint, now returns Cosmos DB data)
            group.MapGet("/", async (ICosmosDbFeedbackService service) =>
            {
                var feedbacks = await service.GetAllFeedbacksAsync();
                return Results.Ok(feedbacks);
            })
            .Produces<List<FeedbackResponseDto>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("feedback").Expire(TimeSpan.FromMinutes(2)));

            // Get completed class IDs (maintain exact same endpoint)
            group.MapGet("/completed/{registrationId}", async (
                ICosmosDbFeedbackService service, 
                int registrationId) =>
            {
                var classIds = await service.GetCompletedClassIdsAsync(registrationId);
                return Results.Ok(classIds);
            })
            .Produces<List<int>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("feedback").Expire(TimeSpan.FromMinutes(10)));
        }
    }
}
