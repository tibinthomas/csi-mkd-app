using Microsoft.EntityFrameworkCore;
using SessionsFunction.Data;
using SessionsFunction.Models;

namespace SessionsFunction.Repositories
{
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
            var today = DateTime.UtcNow.Date;
            var threeDaysFromToday = today.AddDays(3);
            var hasChanges = false;

            // Fetch sessions that need to be deactivated (past)
            var pastSessions = await _context.SessionConfigurations
                .Where(s => s.StartDate.Date < today && s.IsActive)
                .ToListAsync();

            if (pastSessions.Count > 0)
            {
                foreach (var session in pastSessions)
                    session.IsActive = false;

                hasChanges = true;
            }

            // Fetch sessions that need to be deactivated (upcoming in next 3 days)
            var upcomingSessions = await _context.SessionConfigurations
                .Where(s => s.StartDate.Date >= today
                            && s.StartDate.Date <= threeDaysFromToday
                            && s.IsActive)
                .ToListAsync();

            if (upcomingSessions.Count > 0)
            {
                foreach (var session in upcomingSessions)
                    session.IsActive = false;

                hasChanges = true;
            }

            // Save only if any updates happened
            if (hasChanges)
            {
                _context.SessionConfigurations.UpdateRange(pastSessions.Concat(upcomingSessions));
                await _context.SaveChangesAsync();
            }

            // Now return the latest data using compiled query
            var list = new List<SessionConfiguration>();
            await foreach (var session in GetAllSessionsCompiled(_context))
            {
                list.Add(session);
            }
            return list;
        }

        public async Task<List<SessionConfiguration>> GetByYear(int year)
            => await _context.SessionConfigurations
                .AsNoTracking()
                .Where(s => s.StartDate.Year == year)
                .OrderBy(s => s.StartDate)
                .ToListAsync();
    }
}