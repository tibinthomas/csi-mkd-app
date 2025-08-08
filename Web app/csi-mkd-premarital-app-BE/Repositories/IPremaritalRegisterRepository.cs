using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface IPremaritalRegisterRepository
    {
        Task<int> AddRegistration(PremaritalRegistration registration);
        Task AddPremaritalFiles(PremaritalDocument documents);
        Task<bool> UpdatePaymentStatus(int id, bool status);
        Task<bool> CheckEmailExists(string email);
        Task<object> FilterRegistrations(RegistrationFilterDto filter);
        Task<int> GetTotalRegistrations();

    }
}


