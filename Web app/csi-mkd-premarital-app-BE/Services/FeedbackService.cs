using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;

namespace csi_mkd_premarital_app_BE.Services
{
    public class FeedbackService(
        IFeedbackRepository repository,
        ICacheInvalidationService cacheService
    ) : IFeedbackService
    {
        public async Task SubmitFeedbackAsync(ClassFeedbackDto dto)
        {
            var feedback = new ClassFeedback
            {
                ClassId = dto.ClassId,
                Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
                QualityRating = dto.QualityRating,
                RelevanceRating = dto.RelevanceRating,
                EngagementRating = dto.EngagementRating,
                OrganizationRating = dto.OrganizationRating,
                Valuable = dto.Valuable,
                Improvements = dto.Improvements,
                Comments = dto.Comments,
                PremaritalRegistrationId = dto.PremaritalRegistrationId
            };

            await repository.AddAsync(feedback);
            await cacheService.InvalidateFeedbackCachesAsync();
        }

        public Task<List<ClassFeedback>> GetAllFeedbacksAsync()
            => repository.GetAllAsync();

        public Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId)
            => repository.GetCompletedClassIdsAsync(registrationId);

    }
}
