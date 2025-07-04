using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegisterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public RegisterController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] GeneralRegisterDto dto)
        {
            string? photoPath = null;

            if (dto.Photo != null && dto.Photo.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}_{dto.Photo.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Photo.CopyToAsync(stream);
                }

                photoPath = $"uploads/{fileName}";
            }

            var registration = new GeneralRegistration
            {
                Name = dto.Name,
                FatherName = dto.FatherName,
                Address = dto.Address,
                Sex = dto.Sex,
                Age = dto.Age,
                Education = dto.Education,
                Occupation = dto.Occupation,
                ChurchName = dto.ChurchName,
                Phone = dto.Phone,
                Email = dto.Email,
                MaritalStatus = dto.MaritalStatus,
                SessionType = dto.SessionType,
                Declaration = dto.Declaration,
                PhotoPath = photoPath
            };

            _context.GeneralRegistrations.Add(registration);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful" });
        }
    }
}