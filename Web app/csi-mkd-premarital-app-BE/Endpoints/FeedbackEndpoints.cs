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

            group.MapPost("/", async (IFeedbackService service, ClassFeedbackDto dto) =>
            {
                await service.SubmitFeedbackAsync(dto);
                return Results.Ok(new { message = "Feedback submitted successfully." });
            })
            .Accepts<ClassFeedbackDto>("application/json")
            .Produces(StatusCodes.Status200OK);

            group.MapGet("/", async (IFeedbackService service) =>
            {
                var feedbacks = await service.GetAllFeedbacksAsync();
                return Results.Ok(feedbacks);
            })
            .Produces<List<ClassFeedback>>(StatusCodes.Status200OK)
            .CacheOutput(p => p.Tag("feedback").Expire(TimeSpan.FromMinutes(2)));

            group.MapGet("/completed/{registrationId}", async (IFeedbackService service, int registrationId) =>
            {
                var titles = await service.GetCompletedClassIdsAsync(registrationId);
                return Results.Ok(titles);
            })
            .Produces<List<string>>(StatusCodes.Status200OK);
        }
    }
}
