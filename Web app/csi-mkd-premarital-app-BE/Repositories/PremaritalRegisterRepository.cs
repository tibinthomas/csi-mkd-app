using System.Text.Json;
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

        public async Task<Guid> AddRegistration(PremaritalRegistration registration)
        {
            _context.PremaritalRegistrations.Add(registration);
            await _context.SaveChangesAsync();
            return registration.Id;
        }

        // Unified Upsert for PremaritalDocument
        public async Task<bool> UpsertPremaritalFilesAsync(PremaritalDocument dto)
        {
            var existing = await _context.PremaritalDocuments
                .FirstOrDefaultAsync(p => p.RegistrationId == dto.RegistrationId);

            if (existing == null)
            {
                _context.PremaritalDocuments.Add(dto);
                await _context.SaveChangesAsync();
                return true; // new record
            }

            if (!string.IsNullOrEmpty(dto.PhotoUrl))
                existing.PhotoUrl = dto.PhotoUrl;

            if (!string.IsNullOrEmpty(dto.VicarLetterUrl))
                existing.VicarLetterUrl = dto.VicarLetterUrl;

            existing.SubmittedAt = DateTime.UtcNow;

            _context.PremaritalDocuments.Update(existing);
            await _context.SaveChangesAsync();

            return false; // updated record
        }


        public async Task<bool> UpdatePaymentStatus(Guid id, bool status)
        {
            var reg = await _context.PremaritalRegistrations.FindAsync(id);
            if (reg is null) return false;

            _context.Entry(reg).State = EntityState.Modified;
            reg.PaymentStatus = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(bool Exists, Guid? UserId)> CheckEmailExists(string email)
        {
            var registration = await _context.PremaritalRegistrations
                .FirstOrDefaultAsync(r => r.Email.ToLower() == email.ToLower());

            return (registration != null, registration?.Id);
        }

        public async Task<object> FilterRegistrations(RegistrationFilterDto filter)
        {
            var query = _context.PremaritalRegistrations
                .AsNoTracking()
                .Include(r => r.SessionConfiguration)
                .Include(r => r.PremaritalDocument)
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

            if (filter.ActiveSessionOnly == true)
                query = query.Where(r => r.SessionConfiguration != null && r.SessionConfiguration.IsActive);

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
                    r.ChurchName,
                    r.PriestName,
                    r.FianceName,
                    r.DateOfMarriage,
                    r.Phone,
                    r.Email,
                    r.Days,
                    r.ChurchActivitiesJson,
                    r.Declaration,
                    r.SessionId,
                    SessionName = r.SessionConfiguration != null ? r.SessionConfiguration.SessionName : null,
                    PhotoUrl = r.PremaritalDocument != null ? r.PremaritalDocument.PhotoUrl : null,
                    VicarLetterUrl = r.PremaritalDocument != null ? r.PremaritalDocument.VicarLetterUrl : null,
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
            => await _context.PremaritalRegistrations.CountAsync();

        public async Task<PremaritalRegistration?> GetRegistrationById(Guid id)
            => await _context.PremaritalRegistrations
                .FirstOrDefaultAsync(r => r.Id == id);

        public async Task<bool> DeleteRegistration(Guid id)
        {
            var registration = await _context.PremaritalRegistrations
                .Include(r => r.PremaritalDocument)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (registration == null) return false;

            if (registration.PremaritalDocument != null)
                _context.PremaritalDocuments.Remove(registration.PremaritalDocument);

            _context.PremaritalRegistrations.Remove(registration);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateRegistration(Guid id, UpdatePremaritalRegisterDto dto)
        {
            var registration = await _context.PremaritalRegistrations.FindAsync(id);
            if (registration == null) return false;

            _context.Entry(registration).State = EntityState.Modified;

            registration.FirstName = dto.FirstName;
            registration.LastName = dto.LastName;
            registration.FatherName = dto.FatherName;
            registration.Address = dto.Address;
            registration.Sex = dto.Sex;
            registration.Age = dto.Age;
            registration.Education = dto.Education;
            registration.Occupation = dto.Occupation;
            registration.ChurchId = dto.ChurchId;
            registration.ChurchName = dto.ChurchName;
            registration.PriestName = dto.PriestName;
            registration.FianceName = dto.FianceName;
            registration.DateOfMarriage = dto.DateOfMarriage.HasValue
                ? DateTime.SpecifyKind(dto.DateOfMarriage.Value, DateTimeKind.Utc)
                : null;
            registration.Phone = dto.Phone;
            registration.Email = dto.Email;
            registration.Days = dto.Days;

            var churchActivities = new
            {
                dto.ChoirMember,
                dto.SsTeacher,
                dto.YouthFellowship,
                dto.Other
            };
            registration.ChurchActivitiesJson = JsonSerializer.Serialize(churchActivities);

            registration.Declaration = dto.Declaration;
            registration.SessionId = dto.SessionId;
            registration.PaymentStatus = dto.PaymentStatus;

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

        public async Task<PremaritalDocument?> GetPremaritalFilesByRegistrationId(Guid registrationId)
            => await _context.PremaritalDocuments
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.RegistrationId == registrationId);

        public async Task<IEnumerable<PremaritalRegistration>> FilterRegistrationsForVcf(RegistrationFilterDto filter)
        {
            var query = _context.PremaritalRegistrations
                .AsNoTracking()
                .Include(r => r.SessionConfiguration)
                .AsQueryable();

            if (filter.SessionId.HasValue)
            {
                query = query.Where(r => r.SessionId == filter.SessionId.Value);
            }

            if (!string.IsNullOrEmpty(filter.Sex))
            {
                query = query.Where(r => r.Sex == filter.Sex);
            }

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<PremaritalRegistration>> FilterRegistrationsForSpreadsheet(PremaritalRegisterSpreadsheetFilterDto filter)
        {
            var query = _context.PremaritalRegistrations.AsQueryable();

            if (filter.SessionId.HasValue)
            {
                query = query.Where(r => r.SessionId == filter.SessionId.Value);
            }

            if (!string.IsNullOrEmpty(filter.Sex))
            {
                query = query.Where(r => r.Sex == filter.Sex);
            }

            return await query.ToListAsync();
        }

        public async Task<Guid> AddOutsideKeralaRegistration(PremaritalOutsideKeralaRegistration registration)
        {
            _context.PremaritalOutsideKeralaRegistrations.Add(registration);
            await _context.SaveChangesAsync();
            return registration.Id;
        }

        public async Task<bool> UpsertOutsideKeralaFilesAsync(PremaritalOutsideKeralaDocument dto)
        {
            var existing = await _context.PremaritalOutsideKeralaDocuments
                .FirstOrDefaultAsync(p => p.RegistrationId == dto.RegistrationId);

            if (existing == null)
            {
                _context.PremaritalOutsideKeralaDocuments.Add(dto);
                await _context.SaveChangesAsync();
                return true; // new record
            }

            if (!string.IsNullOrEmpty(dto.VicarLetterUrl))
                existing.VicarLetterUrl = dto.VicarLetterUrl;

            existing.SubmittedAt = DateTime.UtcNow;

            _context.PremaritalOutsideKeralaDocuments.Update(existing);
            await _context.SaveChangesAsync();

            return false; // updated record
        }

        public async Task<PremaritalOutsideKeralaRegistration?> GetOutsideKeralaRegistrationById(Guid id)
            => await _context.PremaritalOutsideKeralaRegistrations
                .Include(r => r.Participants)
                .Include(r => r.PremaritalOutsideKeralaDocument)
                .FirstOrDefaultAsync(r => r.Id == id);

        public async Task<bool> DeleteOutsideKeralaRegistration(Guid id)
        {
            var registration = await _context.PremaritalOutsideKeralaRegistrations
                .Include(r => r.PremaritalOutsideKeralaDocument)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (registration == null) return false;

            if (registration.PremaritalOutsideKeralaDocument != null)
                _context.PremaritalOutsideKeralaDocuments.Remove(registration.PremaritalOutsideKeralaDocument);

            _context.PremaritalOutsideKeralaRegistrations.Remove(registration);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
