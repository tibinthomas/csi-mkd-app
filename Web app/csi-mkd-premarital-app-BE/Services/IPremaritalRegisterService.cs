using csi_mkd_premarital_app_BE.DTOs;

namespace csi_mkd_premarital_app_BE.Services
{
    public interface IPremaritalRegisterService
    {
        Task<(int StatusCode, object Data)> Register(PremaritalRegisterDto dto);
        Task<(int StatusCode, object Data)> SaveFiles(PremaritalDocumentDto dto);
        Task<(int StatusCode, object? Data)> UpdatePaymentStatus(int id, PaymentStatusUpdateDto dto);
        Task<bool> CheckEmailExists(string email);
        Task<object> GetFilteredRegistrations(RegistrationFilterDto filter);
        Task<int> GetTotalRegistrations();

    }
}


