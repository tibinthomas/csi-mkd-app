using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface IGeneralRegisterRepository
    {
        Task<int> AddRegistration(GeneralRegistration registration);
        Task AddGeneralFiles(GeneralDocument documents);
        Task<bool> CheckEmailExists(string email);
        Task<bool> UpdatePaymentStatus(int id, bool status);
        Task<object> FilterRegistrations(GeneralRegisterFilterDto filter);

    }
}


