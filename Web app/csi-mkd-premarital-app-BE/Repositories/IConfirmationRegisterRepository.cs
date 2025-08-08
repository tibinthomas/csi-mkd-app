using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface IConfirmationRegisterRepository
    {
        Task<int> AddRegistration(ConfirmationRegistration registration);
        Task AddConfirmationFiles(ConfirmationDocument documents);
        Task<object> FilterRegistrations(ConfirmationRegisterFilterDto filter);
        Task<int> GetTotalRegistrations();

    }
}
