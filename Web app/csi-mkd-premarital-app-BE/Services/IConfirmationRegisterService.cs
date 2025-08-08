using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
namespace csi_mkd_premarital_app_BE.Services
{

    public interface IConfirmationRegisterService
    {
        Task<(int StatusCode, object Data)> Register(ConfirmationRegisterDto dto);
        Task<(int StatusCode, object Data)> SaveFiles(ConfirmationDocumentDto dto);
        Task<object> GetFilteredRegistrations(ConfirmationRegisterFilterDto filter);
        Task<int> GetTotalRegistrations();

    }
}
