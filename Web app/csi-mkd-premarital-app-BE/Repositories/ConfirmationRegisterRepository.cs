using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;
using Microsoft.EntityFrameworkCore;

class ConfirmationRegisterRepository : IConfirmationRegisterRepository
{
    private readonly ApplicationDbContext _context;

    public ConfirmationRegisterRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> AddRegistration(ConfirmationRegistration registration)
    {
        _context.ConfirmationRegistrations.Add(registration);
        await _context.SaveChangesAsync();
        return registration.Id;
    }

    public async Task AddConfirmationFiles(ConfirmationDocument documents)
    {
        _context.ConfirmationDocuments.Add(documents);
        await _context.SaveChangesAsync();
    }

    public async Task<object> FilterRegistrations(ConfirmationRegisterFilterDto filter)
    {
        var query = _context.ConfirmationRegistrations
            .AsNoTracking()
            .Include(r => r.ConfirmationDocument)
            .Include(r => r.Participants)
            .AsQueryable();


        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();

            query = query.Where(r =>
                r.Participants.Any(p => EF.Functions.ILike(p.Name, $"%{search}%")));

        }

        var totalCount = await query.CountAsync();

        var results = await query
            .OrderByDescending(r => r.SubmittedDate)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(r => new
            {
                r.Id,
                r.ChurchId,
                r.PriestName,
                r.ConfirmationDate,
                r.CounsellingDate,
                Participants = r.Participants.Select(p => new
                {
                    p.Name,
                    p.Age
                }).ToList(),
                VicarLetterUrl = r.ConfirmationDocument != null ? r.ConfirmationDocument.VicarLetterUrl : null,
                r.Consent,
            })
            .ToListAsync();

        return new
        {
            totalCount,
            items = results
        };
    }

    public async Task<int> GetTotalRegistrations()
    {
        return await _context.ConfirmationRegistrations.CountAsync();
    }
}
