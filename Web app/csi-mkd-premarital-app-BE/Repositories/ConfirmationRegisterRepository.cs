using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public class ConfirmationRegisterRepository : IConfirmationRegisterRepository
    {
        private readonly ApplicationDbContext _context;

        public ConfirmationRegisterRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ConfirmationRegistration> CreateAsync(ConfirmationRegistration registration)
        {
            _context.ConfirmationRegistrations.Add(registration);
            await _context.SaveChangesAsync();
            return registration;
        }

        public async Task<ConfirmationRegistration?> FindByIdAsync(Guid id)
        {
            var registration = await _context.ConfirmationRegistrations
                .Include(r => r.Participants)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (registration?.Participants != null)
            {
                registration.Participants = registration.Participants.OrderBy(p => p.SubmittedDate).ToList();
            }

            return registration;
        }

        public async Task<IEnumerable<ConfirmationRegistration>> GetFilteredRegistrations(ConfirmationRegisterFilterDto filter)
        {
            var query = _context.ConfirmationRegistrations
                .Include(r => r.ConfirmationDocument)
                .Include(r => r.Participants.OrderBy(p => p.SubmittedDate))
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(r =>
                    r.Participants.Any(p => EF.Functions.ILike(p.Name, $"%{search}%")));
            }

            return await query
                .OrderByDescending(r => r.SubmittedDate)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalRegistrations()
        {
            return await _context.ConfirmationRegistrations.CountAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var registration = await _context.ConfirmationRegistrations.FindAsync(id);
            if (registration != null)
            {
                _context.ConfirmationRegistrations.Remove(registration);
                await _context.SaveChangesAsync();
            }
        }

        public void RemoveParticipants(IEnumerable<Participant> participants)
        {
            _context.Participants.RemoveRange(participants);
        }

        public async Task SaveChangesAsync(ConfirmationRegistration registration)
        {
            _context.Entry(registration).State = EntityState.Modified;

            await _context.SaveChangesAsync();
        }
    }
}
