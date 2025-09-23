using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Services
{
    public interface IPremaritalRegisterService
    {
        Task<(int StatusCode, object Data)> Register(PremaritalRegisterDto dto);
        Task<(int StatusCode, object Data)> UpsertFiles(PremaritalDocumentDto dto);
        Task<(int StatusCode, object? Data)> UpdatePaymentStatus(Guid id, PaymentStatusUpdateDto dto);
        Task<(bool Exists, Guid? UserId)> CheckEmailExists(string email);
        Task<object> GetFilteredRegistrations(RegistrationFilterDto filter);
        Task<int> GetTotalRegistrations();
        Task<PremaritalRegistration?> GetRegistrationById(Guid id);
        Task<bool> DeleteRegistration(Guid id);
        Task<bool> UpdateRegistration(Guid id, UpdatePremaritalRegisterDto dto);
        Task<PremaritalDocument?> GetPremaritalFilesByRegistrationId(Guid registrationId);

    }
}
