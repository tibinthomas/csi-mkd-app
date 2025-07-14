using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;

namespace csi_mkd_premarital_app_BE.Services;

public class SessionConfigService : ISessionConfigService
{
    private readonly ISessionConfigRepository _repo;

    public SessionConfigService(ISessionConfigRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<SessionConfigurationDto>> GetAllSessions()
        => (await _repo.GetAll()).Select(ToDto).ToList();

    public async Task<SessionConfigurationDto?> GetSessionById(int id)
    {
        var session = await _repo.GetById(id);
        return session == null ? null : ToDto(session);
    }

    public async Task<SessionConfigurationDto> CreateSession(CreateUpdateSessionDto dto)
    {
        var session = new SessionConfiguration
        {
            SessionName = dto.SessionName,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            SubmittedDate = DateTime.UtcNow
        };
        await _repo.Create(session);
        return ToDto(session);
    }

    public async Task<bool> UpdateSession(int id, CreateUpdateSessionDto dto)
    {
        var existing = await _repo.GetById(id);
        if (existing == null) return false;

        existing.SessionName = dto.SessionName;
        existing.StartDate = dto.StartDate;
        existing.EndDate = dto.EndDate;
        existing.IsActive = dto.IsActive;
        existing.SubmittedDate = DateTime.UtcNow;

        return await _repo.Update(existing);
    }

    public async Task<bool> DeleteSession(int id)
        => await _repo.Delete(id);

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
