using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Services
{
    public interface IPremaritalRegisterService
    {
        Task<(int StatusCode, object Data)> Register(PremaritalRegisterDto dto);
        Task<(int StatusCode, object Data)> SaveFiles(PremaritalDocumentDto dto);
        Task<(int StatusCode, object? Data)> UpdatePaymentStatus(Guid id, PaymentStatusUpdateDto dto);
        Task<(bool Exists, Guid? UserId)> CheckEmailExists(string email);
        Task<object> GetFilteredRegistrations(RegistrationFilterDto filter);
        Task<int> GetTotalRegistrations();
        Task<object?> GetRegistrationById(Guid id);
    }
}
