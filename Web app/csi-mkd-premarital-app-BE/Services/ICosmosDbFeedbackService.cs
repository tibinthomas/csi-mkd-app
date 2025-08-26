using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Services
{
    public interface ICosmosDbFeedbackService
    {
        Task SubmitFeedbackAsync(ClassFeedbackDto dto, string? userAgent = null, string? ipAddress = null);
        Task<List<ClassFeedbackResponseDto>> GetAllFeedbacksAsync();
        Task<List<ClassFeedbackResponseDto>> GetFeedbacksByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<List<ClassFeedbackResponseDto>> GetFeedbacksByRegistrationIdAsync(Guid registrationId);
        Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId);
        Task<ClassFeedbackResponseDto?> GetFeedbackByIdAsync(string id, string partitionKey);
        Task<List<ClassFeedbackResponseDto>> GetFeedbacksByClassIdAsync(int classId);
        Task<ClassFeedbackAnalyticsDto> GetFeedbackAnalyticsAsync();
        Task<List<ClassFeedbackResponseDto>> GetRecentFeedbackAsync(int count = 10);
    }
}