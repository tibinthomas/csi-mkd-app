using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface IPremaritalRegisterRepository
    {
        Task<Guid> AddRegistration(PremaritalRegistration registration);
        Task AddPremaritalFiles(PremaritalDocument documents);
        Task<bool> UpdatePaymentStatus(Guid id, bool status);
        Task<(bool Exists, Guid? UserId)> CheckEmailExists(string email);
        Task<object> FilterRegistrations(RegistrationFilterDto filter);
        Task<int> GetTotalRegistrations();
        Task<PremaritalRegistration?> GetRegistrationById(Guid id);
        Task<bool> DeleteRegistration(Guid id);
        Task<bool> UpdateRegistration(Guid id, UpdatePremaritalRegisterDto dto);
    }
}
