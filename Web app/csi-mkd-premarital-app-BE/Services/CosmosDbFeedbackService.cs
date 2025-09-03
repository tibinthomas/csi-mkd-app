using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;

namespace csi_mkd_premarital_app_BE.Services
{
    public class CosmosDbFeedbackService : ICosmosDbFeedbackService, IFeedbackService
    {
        private readonly ICosmosDbFeedbackRepository _repository;
        private readonly ICacheInvalidationService _cacheService;

        public CosmosDbFeedbackService(
            ICosmosDbFeedbackRepository repository,
            ICacheInvalidationService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task SubmitFeedbackAsync(ClassFeedbackDto dto, string? userAgent = null, string? ipAddress = null)
        {
            // Create a ClassFeedback document for Cosmos DB storage
            var classFeedback = new ClassFeedback
            {
                PremaritalRegistrationId = dto.PremaritalRegistrationId,
                Email = dto.Email,
                Name = dto.Name,
                UpdatedAt = DateTime.UtcNow
            };

            // Convert DTO feedbacks to model feedback entries
            foreach (var feedbackEntry in dto.Feedbacks)
            {
                var feedbackDetail = new ClassFeedbackDetail
                {
                    Date = feedbackEntry.Value.Date,
                    InstructorId = feedbackEntry.Value.InstructorId,
                    Ratings = new ClassFeedbackRatings
                    {
                        Quality = feedbackEntry.Value.Ratings.Quality,
                        Relevance = feedbackEntry.Value.Ratings.Relevance,
                        Engagement = feedbackEntry.Value.Ratings.Engagement,
                        Organization = feedbackEntry.Value.Ratings.Organization
                    },
                    TextResponses = new ClassFeedbackTextResponses
                    {
                        Comments = feedbackEntry.Value.TextResponses.Comments,
                        Improvements = feedbackEntry.Value.TextResponses.Improvements,
                        Valuable = feedbackEntry.Value.TextResponses.Valuable
                    }
                };

                // Add to FeedbackEntries collection
                classFeedback.FeedbackEntries.Add(new ClassFeedbackEntry
                {
                    ClassId = feedbackEntry.Key,
                    Detail = feedbackDetail
                });
            }

            // Store the ClassFeedback document
            await _repository.AddAsync(classFeedback);
            await _cacheService.InvalidateFeedbackCachesAsync();
        }

        public async Task<List<ClassFeedbackResponseDto>> GetAllFeedbacksAsync()
        {
            var feedbacks = await _repository.GetAllAsync();
            return feedbacks.Select(MapToResponseDto).ToList();
        }

        public async Task<List<ClassFeedbackResponseDto>> GetFeedbacksByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var feedbacks = await _repository.GetByDateRangeAsync(startDate, endDate);
            return feedbacks.Select(MapToResponseDto).ToList();
        }

        public async Task<List<ClassFeedbackResponseDto>> GetFeedbacksByRegistrationIdAsync(Guid registrationId)
        {
            var feedbacks = await _repository.GetByRegistrationIdAsync(registrationId);
            return feedbacks.Select(MapToResponseDto).ToList();
        }

        public async Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId)
        {
            return await _repository.GetCompletedClassIdsAsync(registrationId);
        }

        public async Task<ClassFeedbackResponseDto?> GetFeedbackByIdAsync(string id, string partitionKey)
        {
            var feedback = await _repository.GetByIdAsync(id, partitionKey);
            return feedback != null ? MapToResponseDto(feedback) : null;
        }

        public async Task<List<ClassFeedbackResponseDto>> GetFeedbacksByClassIdAsync(int classId)
        {
            var feedbacks = await _repository.GetByClassIdAsync(classId);
            return feedbacks.Select(MapToResponseDto).ToList();
        }

        public async Task<ClassFeedbackAnalyticsDto> GetFeedbackAnalyticsAsync()
        {
            var averageRatingsByClass = await _repository.GetAverageRatingsByClassAsync();
            var totalCount = await _repository.GetFeedbackCountAsync();
            var recentFeedback = await _repository.GetRecentFeedbackAsync(5);

            var overallAverage = averageRatingsByClass.Values.Count > 0 
                ? averageRatingsByClass.Values.Average() 
                : 0.0;

            return new ClassFeedbackAnalyticsDto
            {
                AverageRatingsByClass = averageRatingsByClass,
                TotalFeedbackCount = (int)totalCount,
                OverallAverageRating = overallAverage,
                RecentFeedback = recentFeedback.Select(MapToResponseDto).ToList(),
                FeedbackByMonth = GenerateFeedbackByMonth(recentFeedback)
            };
        }

        public async Task<List<ClassFeedbackResponseDto>> GetRecentFeedbackAsync(int count = 10)
        {
            var feedbacks = await _repository.GetRecentFeedbackAsync(count);
            return feedbacks.Select(MapToResponseDto).ToList();
        }

        public async Task<int> GetFeedbackEntriesCountByRegistrationIdAsync(Guid registrationId)
        {
            return await _repository.GetFeedbackEntriesCountByRegistrationIdAsync(registrationId);
        }

        private static ClassFeedbackResponseDto MapToResponseDto(ClassFeedback classFeedback)
        {
            // Convert model feedback entries to DTO feedbacks
            var feedbacksDto = new Dictionary<string, ClassFeedbackDetailDto>();
            foreach (var entry in classFeedback.FeedbackEntries)
            {
                feedbacksDto[entry.ClassId] = new ClassFeedbackDetailDto
                {
                    Date = entry.Detail.Date,
                    InstructorId = entry.Detail.InstructorId,
                    Ratings = new ClassFeedbackRatingsDto
                    {
                        Quality = entry.Detail.Ratings.Quality,
                        Relevance = entry.Detail.Ratings.Relevance,
                        Engagement = entry.Detail.Ratings.Engagement,
                        Organization = entry.Detail.Ratings.Organization
                    },
                    TextResponses = new ClassFeedbackTextResponsesDto
                    {
                        Comments = entry.Detail.TextResponses.Comments,
                        Improvements = entry.Detail.TextResponses.Improvements,
                        Valuable = entry.Detail.TextResponses.Valuable
                    }
                };
            }

            return new ClassFeedbackResponseDto
            {
                Id = classFeedback.Id,
                PremaritalRegistrationId = classFeedback.PremaritalRegistrationId,
                Email = classFeedback.Email,
                Name = classFeedback.Name,
                Feedbacks = feedbacksDto,
                CreatedAt = classFeedback.CreatedAt,
                UpdatedAt = classFeedback.UpdatedAt
            };
        }

        private static Dictionary<string, int> GenerateFeedbackByMonth(List<ClassFeedback> recentFeedback)
        {
            return recentFeedback
                .GroupBy(f => f.UpdatedAt.ToString("yyyy-MM"))
                .ToDictionary(g => g.Key, g => g.Count());
        }

        #region IFeedbackService Implementation

        public async Task<ClassFeedbackResponseDto> SubmitFeedbackAsync(ClassFeedbackDto dto)
        {
            await SubmitFeedbackAsync(dto, null, null);

            // Return a simplified response - in a real implementation you'd fetch the saved document
            return new ClassFeedbackResponseDto
            {
                Id = 0, // Cosmos documents don't have int IDs
                PremaritalRegistrationId = dto.PremaritalRegistrationId,
                Email = dto.Email,
                Name = dto.Name,
                Feedbacks = dto.Feedbacks,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public async Task<ClassFeedbackResponseDto?> GetUserFeedbackAsync(Guid premaritalRegistrationId)
        {
            var documents = await GetFeedbacksByRegistrationIdAsync(premaritalRegistrationId);
            if (!documents.Any())
                return null;

            // Return the first document (assuming one document per user in Cosmos)
            return documents.First();
        }

        public async Task<ClassSpecificFeedbackDto> GetFeedbackForClassAsync(Guid premaritalRegistrationId, int classId)
        {
            var userFeedback = await GetUserFeedbackAsync(premaritalRegistrationId);
            
            if (userFeedback == null || !userFeedback.Feedbacks.ContainsKey(classId.ToString()))
            {
                return new ClassSpecificFeedbackDto
                {
                    ClassId = classId,
                    FeedbackDetail = null,
                    HasFeedback = false
                };
            }

            return new ClassSpecificFeedbackDto
            {
                ClassId = classId,
                FeedbackDetail = userFeedback.Feedbacks[classId.ToString()],
                HasFeedback = true
            };
        }

        async Task<List<ClassFeedbackResponseDto>> IFeedbackService.GetAllFeedbacksAsync()
        {
            return await GetAllFeedbacksAsync();
        }

        public async Task<bool> DeleteFeedbackForClassAsync(Guid premaritalRegistrationId, int classId)
        {
            // This would require implementing delete functionality in the Cosmos repository
            // For now, return false as not implemented
            await Task.CompletedTask;
            return false;
        }

        #endregion
    }
}
