using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Services
{
    public interface IFeedbackService
    {
        Task<ClassFeedbackResponseDto> SubmitFeedbackAsync(ClassFeedbackDto dto);
        Task<ClassFeedbackResponseDto?> GetUserFeedbackAsync(Guid premaritalRegistrationId);
        Task<ClassSpecificFeedbackDto> GetFeedbackForClassAsync(Guid premaritalRegistrationId, int classId);
        Task<List<ClassFeedbackResponseDto>> GetAllFeedbacksAsync();
        Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId);
        Task<bool> DeleteFeedbackForClassAsync(Guid premaritalRegistrationId, int classId);
    }
}
