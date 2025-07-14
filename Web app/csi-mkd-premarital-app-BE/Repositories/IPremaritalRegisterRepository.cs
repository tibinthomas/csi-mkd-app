using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface IPremaritalRegisterRepository
    {
        Task AddRegistration(PremaritalRegistration registration);
        Task<object> GetPaginatedRegistrations(int page, int pageSize);
        Task<bool> UpdatePaymentStatus(int id, bool status);
        Task<bool> CheckEmailExists(string email);
        Task<object> FilterRegistrations(RegistrationFilterDto filter);
    }
}


