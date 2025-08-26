using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface IFeedbackRepository
    {
        Task<ClassFeedback?> GetByPremaritalRegistrationIdAsync(Guid premaritalRegistrationId);
        Task<ClassFeedback> CreateOrUpdateAsync(ClassFeedback feedback);
        Task<List<ClassFeedback>> GetAllAsync();
        Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId);
        Task<ClassFeedbackDetail?> GetFeedbackForClassAsync(Guid premaritalRegistrationId, int classId);
        Task UpdateFeedbackForClassAsync(Guid premaritalRegistrationId, int classId, ClassFeedbackDetail feedbackDetail);
        Task<bool> DeleteFeedbackForClassAsync(Guid premaritalRegistrationId, int classId);
    }

}
