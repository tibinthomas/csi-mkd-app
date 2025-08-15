using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;

namespace csi_mkd_premarital_app_BE.Services
{
    public class CosmosDbFeedbackService : ICosmosDbFeedbackService
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

        public async Task SubmitFeedbackAsync(FeedbackDocumentDto dto, string? userAgent = null, string? ipAddress = null)
        {
            var feedbackDocument = new FeedbackDocument
            {
                ClassId = dto.ClassId,
                Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
                Ratings = new FeedbackRatings
                {
                    Quality = dto.QualityRating,
                    Relevance = dto.RelevanceRating,
                    Engagement = dto.EngagementRating,
                    Organization = dto.OrganizationRating
                },
                TextResponses = new FeedbackText
                {
                    Valuable = dto.Valuable,
                    Improvements = dto.Improvements,
                    Comments = dto.Comments
                },
                Metadata = new FeedbackMetadata
                {
                    PremaritalRegistrationId = dto.PremaritalRegistrationId,
                    SessionTitle = dto.SessionTitle,
                    InstructorName = dto.InstructorName,
                    SessionDuration = dto.SessionDuration,
                    Location = dto.Location,
                    Source = dto.Source ?? "web",
                    Platform = dto.Platform ?? string.Empty,
                    UserAgent = userAgent ?? string.Empty,
                    IpAddress = ipAddress ?? string.Empty
                }
            };

            await _repository.AddAsync(feedbackDocument);
            await _cacheService.InvalidateFeedbackCachesAsync();
        }

        public async Task<List<FeedbackResponseDto>> GetAllFeedbacksAsync()
        {
            var documents = await _repository.GetAllAsync();
            return documents.Select(MapToResponseDto).ToList();
        }

        public async Task<List<FeedbackResponseDto>> GetFeedbacksByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var documents = await _repository.GetByDateRangeAsync(startDate, endDate);
            return documents.Select(MapToResponseDto).ToList();
        }

        public async Task<List<FeedbackResponseDto>> GetFeedbacksByRegistrationIdAsync(int registrationId)
        {
            var documents = await _repository.GetByRegistrationIdAsync(registrationId);
            return documents.Select(MapToResponseDto).ToList();
        }

        public async Task<List<int>> GetCompletedClassIdsAsync(int registrationId)
        {
            return await _repository.GetCompletedClassIdsAsync(registrationId);
        }

        public async Task<FeedbackResponseDto?> GetFeedbackByIdAsync(string id, string partitionKey)
        {
            var document = await _repository.GetByIdAsync(id, partitionKey);
            return document != null ? MapToResponseDto(document) : null;
        }

        public async Task<List<FeedbackResponseDto>> GetFeedbacksByClassIdAsync(int classId)
        {
            var documents = await _repository.GetByClassIdAsync(classId);
            return documents.Select(MapToResponseDto).ToList();
        }

        public async Task<FeedbackAnalyticsDto> GetFeedbackAnalyticsAsync()
        {
            var averageRatingsByClass = await _repository.GetAverageRatingsByClassAsync();
            var totalCount = await _repository.GetFeedbackCountAsync();
            var recentFeedback = await _repository.GetRecentFeedbackAsync(5);

            var overallAverage = averageRatingsByClass.Values.Count > 0 
                ? averageRatingsByClass.Values.Average() 
                : 0.0;

            return new FeedbackAnalyticsDto
            {
                AverageRatingsByClass = averageRatingsByClass,
                TotalFeedbackCount = totalCount,
                OverallAverageRating = overallAverage,
                RecentFeedback = recentFeedback.Select(MapToResponseDto).ToList(),
                FeedbackByMonth = GenerateFeedbackByMonth(recentFeedback)
            };
        }

        public async Task<List<FeedbackResponseDto>> GetRecentFeedbackAsync(int count = 10)
        {
            var documents = await _repository.GetRecentFeedbackAsync(count);
            return documents.Select(MapToResponseDto).ToList();
        }

        private static FeedbackResponseDto MapToResponseDto(FeedbackDocument document)
        {
            return new FeedbackResponseDto
            {
                Id = document.id,
                ClassId = document.ClassId,
                Date = document.Date,
                SubmittedAt = document.SubmittedAt,
                Ratings = new FeedbackRatingsDto
                {
                    Quality = document.Ratings.Quality,
                    Relevance = document.Ratings.Relevance,
                    Engagement = document.Ratings.Engagement,
                    Organization = document.Ratings.Organization,
                    Average = document.Ratings.Average
                },
                TextResponses = new FeedbackTextDto
                {
                    Valuable = document.TextResponses.Valuable,
                    Improvements = document.TextResponses.Improvements,
                    Comments = document.TextResponses.Comments,
                    TotalCharacters = document.TextResponses.TotalCharacters,
                    HasDetailedFeedback = document.TextResponses.HasDetailedFeedback
                },
                Metadata = new FeedbackMetadataDto
                {
                    PremaritalRegistrationId = document.Metadata.PremaritalRegistrationId,
                    SessionTitle = document.Metadata.SessionTitle,
                    InstructorName = document.Metadata.InstructorName,
                    SessionDuration = document.Metadata.SessionDuration,
                    Location = document.Metadata.Location,
                    Source = document.Metadata.Source,
                    Platform = document.Metadata.Platform,
                    CreatedAt = document.Metadata.CreatedAt,
                    Version = document.Metadata.Version
                }
            };
        }

        private static Dictionary<string, int> GenerateFeedbackByMonth(List<FeedbackDocument> recentFeedback)
        {
            return recentFeedback
                .GroupBy(f => f.Date.ToString("yyyy-MM"))
                .ToDictionary(g => g.Key, g => g.Count());
        }
    }
}