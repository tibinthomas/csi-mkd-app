using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface ICosmosDbFeedbackRepository
    {
        Task AddAsync(ClassFeedback feedback);
        Task<List<ClassFeedback>> GetAllAsync();
        Task<List<ClassFeedback>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<List<ClassFeedback>> GetByRegistrationIdAsync(Guid registrationId);
        Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId);
        Task<ClassFeedback?> GetByIdAsync(string id, string partitionKey);
        Task<List<ClassFeedback>> GetByClassIdAsync(int classId);
        Task<Dictionary<int, double>> GetAverageRatingsByClassAsync();
        Task<long> GetFeedbackCountAsync();
        Task<List<ClassFeedback>> GetRecentFeedbackAsync(int count = 10);
    }
}