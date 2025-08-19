using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Services
{
    public interface ICosmosDbFeedbackService
    {
        Task SubmitFeedbackAsync(FeedbackDocumentDto dto, string? userAgent = null, string? ipAddress = null);
        Task<List<FeedbackResponseDto>> GetAllFeedbacksAsync();
        Task<List<FeedbackResponseDto>> GetFeedbacksByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<List<FeedbackResponseDto>> GetFeedbacksByRegistrationIdAsync(Guid registrationId);
        Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId);
        Task<FeedbackResponseDto?> GetFeedbackByIdAsync(string id, string partitionKey);
        Task<List<FeedbackResponseDto>> GetFeedbacksByClassIdAsync(int classId);
        Task<FeedbackAnalyticsDto> GetFeedbackAnalyticsAsync();
        Task<List<FeedbackResponseDto>> GetRecentFeedbackAsync(int count = 10);
    }
}