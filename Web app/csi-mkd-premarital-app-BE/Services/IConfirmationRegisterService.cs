using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Services
{
    public interface IConfirmationRegisterService
    {
        Task<ServiceResponse<ConfirmationRegistration>> Register(ConfirmationRegisterDto confirmationRegisterDto);
        Task<ServiceResponse<ConfirmationDocument>> SaveFiles(ConfirmationDocumentDto confirmationDocumentDto);
        Task<IEnumerable<ConfirmationRegistration>> GetFilteredRegistrations(ConfirmationRegisterFilterDto filter);
        Task<int> GetTotalRegistrations();
        Task<(int StatusCode, string Message)> DeleteAsync(Guid id);
        Task<(int StatusCode, string Message)> UpdateAsync(Guid id, UpdateConfirmationRegisterDto dto);
    }
}
