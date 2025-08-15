using SessionsFunction.DTOs;

namespace SessionsFunction.Services
{
    public interface ISessionConfigService
    {
        Task<List<SessionConfigurationDto>> GetAllSessions();
        Task<List<SessionConfigurationDto>> GetSessionsByYear(int year);
    }
}