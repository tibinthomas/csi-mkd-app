using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories;

public class SessionConfigRepository : ISessionConfigRepository
{
    private readonly ApplicationDbContext _context;

    public SessionConfigRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SessionConfiguration>> GetAll()
        => await _context.SessionConfigurations.ToListAsync();

    public async Task<SessionConfiguration?> GetById(int id)
        => await _context.SessionConfigurations.FindAsync(id);

    public async Task Create(SessionConfiguration session)
    {
        _context.SessionConfigurations.Add(session);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> Update(SessionConfiguration session)
    {
        _context.Entry(session).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;
        }
    }

    public async Task<bool> Delete(int id)
    {
        var session = await _context.SessionConfigurations.FindAsync(id);
        if (session == null) return false;

        var inUse = await _context.PremaritalRegistrations.AnyAsync(r => r.SessionId == id);
        if (inUse) return false;

        _context.SessionConfigurations.Remove(session);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<SessionConfiguration>> GetByYear(int year)
        => await _context.SessionConfigurations
            .Where(s => s.StartDate.Year == year)
            .OrderBy(s => s.StartDate)
            .ToListAsync();
}
