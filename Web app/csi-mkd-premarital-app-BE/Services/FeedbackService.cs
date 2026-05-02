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
        public async Task<ClassFeedbackResponseDto> SubmitFeedbackAsync(ClassFeedbackDto dto)
        {
            var feedback = new ClassFeedback
            {
                PremaritalRegistrationId = dto.PremaritalRegistrationId,
                Email = dto.Email,
                Name = dto.Name,
                Feedbacks = dto.Feedbacks.ToDictionary(
                    kvp => kvp.Key,
                    kvp => new ClassFeedbackDetail
                    {
                        Date = DateTime.SpecifyKind(kvp.Value.Date, DateTimeKind.Utc),
                        InstructorId = kvp.Value.InstructorId,
                        Ratings = new ClassFeedbackRatings
                        {
                            Quality = kvp.Value.Ratings.Quality,
                            Relevance = kvp.Value.Ratings.Relevance,
                            Engagement = kvp.Value.Ratings.Engagement,
                            Organization = kvp.Value.Ratings.Organization
                        },
                        TextResponses = new ClassFeedbackTextResponses
                        {
                            Comments = kvp.Value.TextResponses.Comments,
                            Improvements = kvp.Value.TextResponses.Improvements,
                            Valuable = kvp.Value.TextResponses.Valuable
                        }
                    })
            };

            var savedFeedback = await repository.CreateOrUpdateAsync(feedback);
            await cacheService.InvalidateFeedbackCachesAsync();

            return MapToResponseDto(savedFeedback);
        }


        public async Task<ClassFeedbackResponseDto?> GetUserFeedbackAsync(Guid premaritalRegistrationId)
        {
            var feedback = await repository.GetByPremaritalRegistrationIdAsync(premaritalRegistrationId);
            return feedback != null ? MapToResponseDto(feedback) : null;
        }

        public async Task<ClassSpecificFeedbackDto> GetFeedbackForClassAsync(Guid premaritalRegistrationId, int classId)
        {
            var feedbackDetail = await repository.GetFeedbackForClassAsync(premaritalRegistrationId, classId);
            
            return new ClassSpecificFeedbackDto
            {
                ClassId = classId,
                FeedbackDetail = feedbackDetail != null ? MapToDetailDto(feedbackDetail) : null,
                HasFeedback = feedbackDetail != null
            };
        }

        public async Task<List<ClassFeedbackResponseDto>> GetAllFeedbacksAsync()
        {
            var feedbacks = await repository.GetAllAsync();
            return feedbacks.Select(MapToResponseDto).ToList();
        }

        public Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId)
            => repository.GetCompletedClassIdsAsync(registrationId);

        public async Task<bool> DeleteFeedbackForClassAsync(Guid premaritalRegistrationId, int classId)
        {
            var result = await repository.DeleteFeedbackForClassAsync(premaritalRegistrationId, classId);
            if (result)
                await cacheService.InvalidateFeedbackCachesAsync();
            return result;
        }

        private static ClassFeedbackResponseDto MapToResponseDto(ClassFeedback feedback)
        {
            return new ClassFeedbackResponseDto
            {
                Id = feedback.Id,
                PremaritalRegistrationId = feedback.PremaritalRegistrationId,
                Email = feedback.Email,
                Name = feedback.Name,
                Feedbacks = feedback.Feedbacks.ToDictionary(
                    kvp => kvp.Key,
                    kvp => MapToDetailDto(kvp.Value)
                ),
                CreatedAt = feedback.CreatedAt,
                UpdatedAt = feedback.UpdatedAt
            };
        }

        private static ClassFeedbackDetailDto MapToDetailDto(ClassFeedbackDetail detail)
        {
            return new ClassFeedbackDetailDto
            {
                Date = detail.Date,
                InstructorId = detail.InstructorId,
                Ratings = new ClassFeedbackRatingsDto
                {
                    Quality = detail.Ratings.Quality,
                    Relevance = detail.Ratings.Relevance,
                    Engagement = detail.Ratings.Engagement,
                    Organization = detail.Ratings.Organization
                },
                TextResponses = new ClassFeedbackTextResponsesDto
                {
                    Comments = detail.TextResponses.Comments,
                    Improvements = detail.TextResponses.Improvements,
                    Valuable = detail.TextResponses.Valuable
                }
            };
        }
    }
}
