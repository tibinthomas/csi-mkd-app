using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface IFeedbackRepository
    {
        Task AddAsync(ClassFeedback feedback);
        Task<List<ClassFeedback>> GetAllAsync();
        Task<List<int>> GetCompletedClassIdsAsync(int registrationId);
    }

}
