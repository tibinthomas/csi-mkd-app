using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Services
{
    public interface IFeedbackService
    {
        Task SubmitFeedbackAsync(ClassFeedbackDto dto);
        Task<List<ClassFeedback>> GetAllFeedbacksAsync();
        Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId);
    }
}
