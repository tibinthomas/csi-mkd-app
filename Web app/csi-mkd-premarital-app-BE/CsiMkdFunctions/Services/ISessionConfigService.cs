using CsiMkdFunctions.DTOs;

namespace CsiMkdFunctions.Services
{
    public interface ISessionConfigService
    {
        Task<List<SessionConfigurationDto>> GetAllSessions();
        Task<List<SessionConfigurationDto>> GetSessionsByYear(int year);
    }
}