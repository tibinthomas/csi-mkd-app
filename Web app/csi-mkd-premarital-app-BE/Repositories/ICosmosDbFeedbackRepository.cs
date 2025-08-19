using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface ICosmosDbFeedbackRepository
    {
        Task AddAsync(FeedbackDocument feedback);
        Task<List<FeedbackDocument>> GetAllAsync();
        Task<List<FeedbackDocument>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<List<FeedbackDocument>> GetByRegistrationIdAsync(Guid registrationId);
        Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId);
        Task<FeedbackDocument?> GetByIdAsync(string id, string partitionKey);
        Task<List<FeedbackDocument>> GetByClassIdAsync(int classId);
        Task<Dictionary<int, double>> GetAverageRatingsByClassAsync();
        Task<long> GetFeedbackCountAsync();
        Task<List<FeedbackDocument>> GetRecentFeedbackAsync(int count = 10);
    }
}