using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public interface IConfirmationRegisterRepository
    {
        Task<ConfirmationRegistration> CreateAsync(ConfirmationRegistration registration);
        Task<ConfirmationRegistration?> FindByIdAsync(Guid id);
        Task<IEnumerable<ConfirmationRegistration>> GetFilteredRegistrations(ConfirmationRegisterFilterDto filter);
        Task<int> GetTotalRegistrations();
        Task DeleteAsync(Guid id);
        void RemoveParticipants(IEnumerable<Participant> participants);
        Task AddConfirmationFiles(ConfirmationDocument documents);
        Task SaveChangesAsync();
    }
}
