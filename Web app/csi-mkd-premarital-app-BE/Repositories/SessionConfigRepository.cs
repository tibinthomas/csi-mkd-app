using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories;

public class SessionConfigRepository : ISessionConfigRepository
{
    private readonly ApplicationDbContext _context;
    private static readonly Func<ApplicationDbContext, IAsyncEnumerable<SessionConfiguration>> GetAllSessionsCompiled
        = EF.CompileAsyncQuery((ApplicationDbContext ctx)
            => ctx.SessionConfigurations.AsNoTracking());

    public SessionConfigRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SessionConfiguration>> GetAll()
    {
        // var today = DateTime.UtcNow.Date;
        // var threeDaysFromToday = today.AddDays(3);
        // var hasChanges = false;

        // // Fetch sessions that need to be deactivated (past)
        // var pastSessions = await _context.SessionConfigurations
        //     .Where(s => s.StartDate.Date < today && s.IsActive)
        //     .ToListAsync();

        // if (pastSessions.Count > 0)
        // {
        //     foreach (var session in pastSessions)
        //         session.IsActive = false;

        //     hasChanges = true;
        // }

        // // Fetch sessions that need to be deactivated (upcoming in next 3 days)
        // var upcomingSessions = await _context.SessionConfigurations
        //     .Where(s => s.StartDate.Date >= today
        //                 && s.StartDate.Date <= threeDaysFromToday
        //                 && s.IsActive)
        //     .ToListAsync();

        // if (upcomingSessions.Count > 0)
        // {
        //     foreach (var session in upcomingSessions)
        //         session.IsActive = false;

        //     hasChanges = true;
        // }

        // // Save only if any updates happened
        // if (hasChanges)
        // {
        //     _context.SessionConfigurations.UpdateRange(pastSessions.Concat(upcomingSessions));
        //     await _context.SaveChangesAsync();
        // }

        // Now return the latest data using compiled query
        var list = new List<SessionConfiguration>();
        await foreach (var session in GetAllSessionsCompiled(_context))
        {
            list.Add(session);
        }
        return list;
    }


    public async Task<SessionConfiguration?> GetById(int id)
        => await _context.SessionConfigurations.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);

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
            .AsNoTracking()
            .Where(s => s.StartDate.Year == year)
            .OrderBy(s => s.StartDate)
            .ToListAsync();


   public async Task<int> DeactivateUpcomingSessionsAsync()
{
    var today = DateTime.UtcNow.Date;
    var threeDaysFromToday = today.AddDays(3);

    var upcomingSessions = await _context.SessionConfigurations
        .Where(s => s.StartDate.Date >= today 
                    && s.StartDate.Date <= threeDaysFromToday 
                    && s.IsActive)
        .ToListAsync();

    if (upcomingSessions.Count == 0)
    {
        return 0;
    }

    foreach (var session in upcomingSessions)
    {
        session.IsActive = false;
    }

    _context.SessionConfigurations.UpdateRange(upcomingSessions);
    return await _context.SaveChangesAsync();
}

    public async Task<int> DeactivatePastSessionsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var pastSessions = await _context.SessionConfigurations
            .Where(s => s.StartDate.Date < today && s.IsActive)
            .ToListAsync();

        if (pastSessions.Count == 0)
        {
            return 0;
        }

        foreach (var session in pastSessions)
        {
            session.IsActive = false;
        }

        _context.SessionConfigurations.UpdateRange(pastSessions);
        return await _context.SaveChangesAsync();
    }

}
