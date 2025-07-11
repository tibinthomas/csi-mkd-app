using csi_mkd_premarital_app_BE.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using csi_mkd_premarital_app_BE.Services;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PremaritalRegisterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        private readonly EmailService _emailService;

        public PremaritalRegisterController(ApplicationDbContext context, IWebHostEnvironment env, EmailService emailService)
        {
            _context = context;
            _env = env;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromForm] PremaritalRegistrationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Save files to wwwroot/uploads or any folder you prefer
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Save Photo
            var photoFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Photo.FileName)}";
            var photoPath = Path.Combine(uploadsFolder, photoFileName);
            using (var photoStream = new FileStream(photoPath, FileMode.Create))
            {
                await dto.Photo.CopyToAsync(photoStream);
            }

            // Save Vicar Letter
            var vicarLetterFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.VicarLetter.FileName)}";
            var vicarLetterPath = Path.Combine(uploadsFolder, vicarLetterFileName);
            using (var vicarStream = new FileStream(vicarLetterPath, FileMode.Create))
            {
                await dto.VicarLetter.CopyToAsync(vicarStream);
            }
            // Compose Church Activities JSON
            var churchActivities = new
            {
                choirMember = dto.ChoirMember,
                ssTeacher = dto.SsTeacher,
                youthFellowship = dto.YouthFellowship,
                other = dto.Other
            };

            var churchActivitiesJson = JsonSerializer.Serialize(churchActivities);

            // Map DTO to entity
            var registration = new PremaritalRegistration
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                FatherName = dto.FatherName,
                Address = dto.Address,
                Sex = dto.Sex,
                Age = dto.Age,
                Education = dto.Education,
                Occupation = dto.Occupation,
                ChurchName = dto.ChurchName,
                FianceName = dto.FianceName,
                DateOfMarriage = dto.DateOfMarriage,
                Phone = dto.Phone,
                Email = dto.Email,
                Days = dto.Days,
                ChurchActivitiesJson = churchActivitiesJson,
                Declaration = dto.Declaration,
                PhotoFilePath = $"/uploads/{photoFileName}",
                VicarLetterFilePath = $"/uploads/{vicarLetterFileName}",
                SessionId = dto.SessionId,
                PaymentStatus = dto.PaymentStatus,
            };
            _context.PremaritalRegistrations.Add(registration);
            await _context.SaveChangesAsync();
            _emailService.SendConfirmationEmail(dto.Email, dto.FirstName);

            return Ok(new { message = "Registered and email sent!" });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRegistrations([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
            {
                return BadRequest(new { message = "Page and pageSize must be greater than 0." });
            }

            var query = _context.PremaritalRegistrations
                .Include(r => r.SessionConfiguration)
                .AsNoTracking()
                .OrderByDescending(r => r.Id);

            var totalCount = await query.CountAsync();

            var paginatedData = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (paginatedData.Any(r => r.SessionConfiguration == null))
            {
                return StatusCode(500, "One or more registrations are missing associated session configuration.");
            }

            var items = paginatedData.Select(r => new
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
            });

            return Ok(new
            {
                totalCount,
                items
            });
        }

        [HttpPut("{id}/paymentstatus")]
        public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] PaymentStatusUpdateDto dto)
        {
            var registration = await _context.PremaritalRegistrations.FindAsync(id);
            if (registration == null)
                return NotFound();

            registration.PaymentStatus = dto.PaymentStatus;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Payment status updated successfully" });
            }
            catch (DbUpdateException)
            {
                // Log error if needed
                return StatusCode(500, "Failed to update payment status");
            }
        }

        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            var exists = await _context.PremaritalRegistrations
                .AnyAsync(r => r.Email.ToLower() == email.ToLower());

            return Ok(new { exists });
        }
    }
}