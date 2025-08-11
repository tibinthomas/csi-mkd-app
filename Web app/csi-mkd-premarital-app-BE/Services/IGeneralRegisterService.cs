using csi_mkd_premarital_app_BE.DTOs;
namespace csi_mkd_premarital_app_BE.Services
{

    public interface IGeneralRegisterService
    {
        Task<(int StatusCode, object Data)> Register(GeneralRegisterDto dto);
        Task<(int StatusCode, object Data)> SaveFiles(GeneralDocumentDto dto);
        Task<bool> CheckEmailExists(string email);
        Task<(int StatusCode, object? Data)> UpdatePaymentStatus(int id, PaymentStatusUpdateDto dto);
        Task<object> GetFilteredRegistrations(GeneralRegisterFilterDto filter);
        Task<int> GetTotalRegistrations();

    }
}
