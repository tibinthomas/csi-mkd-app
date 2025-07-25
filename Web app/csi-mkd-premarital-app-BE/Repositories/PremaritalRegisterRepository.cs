using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories
{

    public class PremaritalRegisterRepository : IPremaritalRegisterRepository
    {
        private readonly ApplicationDbContext _context;

        public PremaritalRegisterRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> AddRegistration(PremaritalRegistration registration)
        {
            _context.PremaritalRegistrations.Add(registration);
            await _context.SaveChangesAsync();
            return registration.Id;
        }

        public async Task AddPremaritalFiles(PremaritalDocument documents)
        {
            _context.PremaritalDocuments.Add(documents);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdatePaymentStatus(int id, bool status)
        {
            var reg = await _context.PremaritalRegistrations.FindAsync(id);
            if (reg is null) return false;

            reg.PaymentStatus = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckEmailExists(string email)
            => await _context.PremaritalRegistrations
                .AnyAsync(r => r.Email.ToLower() == email.ToLower());

        public async Task<object> FilterRegistrations(RegistrationFilterDto filter)
        {
            var query = _context.PremaritalRegistrations
                .Include(r => r.SessionConfiguration)
                .Include(r => r.PremaritalDocument)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.ToLower();

                query = query.Where(r =>
                    r.FirstName.ToLower().Contains(search) ||
                    r.LastName.ToLower().Contains(search) ||
                    r.Email.ToLower().Contains(search));
            }

            if (filter.UnapprovedOnly == true)
                query = query.Where(r => !r.PaymentStatus);

            if (filter.ActiveSessionOnly == true)
                query = query.Where(r => r.SessionConfiguration != null && r.SessionConfiguration.IsActive);

            // Default SessionYear to current year if not specified
            var sessionYear = filter.SessionYear ?? DateTime.UtcNow.Year;

            query = query.Where(r => r.SessionConfiguration != null && r.SessionConfiguration.StartDate.Year == sessionYear);

            if (!string.IsNullOrEmpty(filter.SessionName))
            {
                query = query.Where(r => r.SessionConfiguration != null && r.SessionConfiguration.SessionName == filter.SessionName);
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(r => r.SubmittedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new
            {
                totalCount,
                items = results.Select(r => new
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
                    r.ChurchName,
                    r.FianceName,
                    r.DateOfMarriage,
                    r.Phone,
                    r.Email,
                    r.Days,
                    r.ChurchActivitiesJson,
                    r.Declaration,
                    r.SessionId,
                    r.SessionConfiguration!.SessionName,
                    r.PremaritalDocument!.PhotoUrl,
                    r.PremaritalDocument!.VicarLetterUrl,
                    r.PaymentStatus,
                })
            };
        }
    }

}

