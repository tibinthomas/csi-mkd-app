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

        public async Task AddRegistration(PremaritalRegistration registration)
        {
            _context.PremaritalRegistrations.Add(registration);
            await _context.SaveChangesAsync();
        }

        public async Task<object> GetPaginatedRegistrations(int page, int pageSize)
        {
            var query = _context.PremaritalRegistrations
                .Include(r => r.SessionConfiguration)
                .AsNoTracking()
                .OrderByDescending(r => r.Id);

            var totalCount = await query.CountAsync();

            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new
            {
                totalCount,
                items = data.Select(r => new
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
                    SessionName = r.SessionConfiguration!.SessionName,
                    PhotoPath = r.PhotoFilePath,
                    VicarLetterPath = r.VicarLetterFilePath,
                    r.PaymentStatus,
                })
            };
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
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                query = query.Where(r =>
                    r.FirstName.Contains(filter.Search) ||
                    r.LastName.Contains(filter.Search) ||
                    r.Email.Contains(filter.Search));
            }

            if (filter.UnapprovedOnly == true)
                query = query.Where(r => !r.PaymentStatus);

            if (filter.ActiveSessionOnly == true)
                query = query.Where(r => r.SessionConfiguration != null && r.SessionConfiguration.IsActive);

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
                    SessionName = r.SessionConfiguration!.SessionName,
                    PhotoPath = r.PhotoFilePath,
                    VicarLetterPath = r.VicarLetterFilePath,
                    r.PaymentStatus,
                })
            };
        }
    }

}

