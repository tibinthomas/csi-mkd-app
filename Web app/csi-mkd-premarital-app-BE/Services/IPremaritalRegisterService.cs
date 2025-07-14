using csi_mkd_premarital_app_BE.DTOs;

namespace csi_mkd_premarital_app_BE.Services
{
    public interface IPremaritalRegisterService
    {
        Task<(int StatusCode, object Data)> Register(PremaritalRegistrationDto dto);
        Task<object> GetAllRegistrations(int page, int pageSize);
        Task<(int StatusCode, object? Data)> UpdatePaymentStatus(int id, PaymentStatusUpdateDto dto);
        Task<object> CheckEmailExists(string email);
        Task<object> GetFilteredRegistrations(RegistrationFilterDto filter);
    }
}


