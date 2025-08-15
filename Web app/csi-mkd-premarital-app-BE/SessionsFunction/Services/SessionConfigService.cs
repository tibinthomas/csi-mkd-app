using SessionsFunction.DTOs;
using SessionsFunction.Models;
using SessionsFunction.Repositories;

namespace SessionsFunction.Services
{
    public class SessionConfigService : ISessionConfigService
    {
        private readonly ISessionConfigRepository _repo;

        public SessionConfigService(ISessionConfigRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<SessionConfigurationDto>> GetAllSessions()
            => (await _repo.GetAll()).Select(ToDto).ToList();

        public async Task<List<SessionConfigurationDto>> GetSessionsByYear(int year)
            => (await _repo.GetByYear(year)).Select(ToDto).ToList();

        private static SessionConfigurationDto ToDto(SessionConfiguration s) => new()
        {
            Id = s.Id,
            SessionName = s.SessionName,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            IsActive = s.IsActive,
            SubmittedDate = s.SubmittedDate,
        };
    }
}