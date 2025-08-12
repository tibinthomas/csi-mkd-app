using csi_mkd_premarital_app_BE.DTOs;

namespace csi_mkd_premarital_app_BE.Services;

public interface ISessionConfigService
{
    Task<List<SessionConfigurationDto>> GetAllSessions();
    Task<SessionConfigurationDto?> GetSessionById(int id);
    Task<SessionConfigurationDto> CreateSession(CreateUpdateSessionDto dto);
    Task<bool> UpdateSession(int id, CreateUpdateSessionDto dto);
    Task<bool> DeleteSession(int id);
    Task<List<SessionConfigurationDto>> GetSessionsByYear(int year);
    Task DeactivateSessionsStartingIn3DaysAsync();

}
