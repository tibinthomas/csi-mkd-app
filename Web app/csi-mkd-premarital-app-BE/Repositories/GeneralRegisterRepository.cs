using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories;

public class GeneralRegisterRepository : IGeneralRegisterRepository
{
    private readonly ApplicationDbContext _context;

    public GeneralRegisterRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> AddRegistration(GeneralRegistration registration)
    {
        _context.GeneralRegistrations.Add(registration);
        await _context.SaveChangesAsync();
        return registration.Id;
    }

    public async Task AddGeneralFiles(GeneralDocument documents)
    {
        _context.GeneralDocuments.Add(documents);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> CheckEmailExists(string email)
        => await _context.GeneralRegistrations
                .AnyAsync(r => r.Email.ToLower() == email.ToLower());

    public async Task<bool> UpdatePaymentStatus(Guid id, bool status)
    {
        var reg = await _context.GeneralRegistrations.FindAsync(id);
        if (reg is null) return false;

        // Explicitly track the entity since global NoTracking is enabled
        _context.Entry(reg).State = EntityState.Modified;
        reg.PaymentStatus = status;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<object> FilterRegistrations(GeneralRegisterFilterDto filter)
    {
        var query = _context.GeneralRegistrations
            .AsNoTracking()
            .Include(r => r.GeneralDocument)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.ToLower();

            query = query.Where(r =>
                EF.Functions.ILike(r.FirstName, $"%{search}%") ||
                EF.Functions.ILike(r.LastName, $"%{search}%") ||
                EF.Functions.ILike(r.Email, $"%{search}%"));
        }

        if (filter.UnapprovedOnly == true)
            query = query.Where(r => !r.PaymentStatus);


        var totalCount = await query.CountAsync();

        var results = await query
            .OrderByDescending(r => r.SubmittedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(r => new
            {
                r.Id,
                r.FirstName,
                r.LastName,
                r.FatherName,
                r.Address,
                r.Sex,
                r.Age,
                r.Education,
                r.Occupation,
                r.ChurchId,
                r.PriestName,
                r.Phone,
                r.Email,
                r.SessionType,
                r.MaritalStatus,
                r.Declaration,
                PhotoUrl = r.GeneralDocument != null ? r.GeneralDocument.PhotoUrl : null,
                r.PaymentStatus,
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
        return await _context.GeneralRegistrations.CountAsync();
    }

    public async Task<GeneralRegistration?> GetRegistrationById(Guid id)
        => await _context.GeneralRegistrations.FindAsync(id);

    public async Task<bool> DeleteRegistration(Guid id)
    {
        var registration = await _context.GeneralRegistrations
            .Include(r => r.GeneralDocument)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (registration == null)
            return false;

        // Remove associated document if exists
        if (registration.GeneralDocument != null)
        {
            _context.GeneralDocuments.Remove(registration.GeneralDocument);
        }

        _context.GeneralRegistrations.Remove(registration);
        await _context.SaveChangesAsync();
        return true;
    }
}
