using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories;

public interface ISessionConfigRepository
{
    Task<List<SessionConfiguration>> GetAll();
    Task<SessionConfiguration?> GetById(int id);
    Task Create(SessionConfiguration session);
    Task<bool> Update(SessionConfiguration session);
    Task<bool> Delete(int id);
    Task<List<SessionConfiguration>> GetByYear(int year);
}
