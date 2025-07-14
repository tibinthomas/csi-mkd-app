using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;
using Microsoft.AspNetCore.Hosting;
using System.Text.Json;

namespace csi_mkd_premarital_app_BE.Services
{
    public class PremaritalRegisterService : IPremaritalRegisterService
    {
        private readonly IPremaritalRegisterRepository _repo;
        private readonly IWebHostEnvironment _env;
        private readonly EmailService _emailService;

        public PremaritalRegisterService(IPremaritalRegisterRepository repo, IWebHostEnvironment env, EmailService emailService)
        {
            _repo = repo;
            _env = env;
            _emailService = emailService;
        }

        public async Task<(int StatusCode, object Data)> Register(PremaritalRegistrationDto dto)
        {
            if (dto == null) return (400, new { message = "Invalid input" });

            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var photoFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Photo.FileName)}";
            var vicarFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.VicarLetter.FileName)}";

            var photoPath = Path.Combine(uploadsFolder, photoFileName);
            var vicarPath = Path.Combine(uploadsFolder, vicarFileName);

            await using var photoStream = new FileStream(photoPath, FileMode.Create);
            await dto.Photo.CopyToAsync(photoStream);

            await using var vicarStream = new FileStream(vicarPath, FileMode.Create);
            await dto.VicarLetter.CopyToAsync(vicarStream);

            var churchActivities = new
            {
                dto.ChoirMember,
                dto.SsTeacher,
                dto.YouthFellowship,
                dto.Other
            };

            var entity = new PremaritalRegistration
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
                ChurchActivitiesJson = JsonSerializer.Serialize(churchActivities),
                Declaration = dto.Declaration,
                PhotoFilePath = $"/uploads/{photoFileName}",
                VicarLetterFilePath = $"/uploads/{vicarFileName}",
                SessionId = dto.SessionId,
                PaymentStatus = dto.PaymentStatus,
                SubmittedAt = DateTime.UtcNow
            };

            await _repo.AddRegistration(entity);
            _emailService.SendConfirmationEmail(dto.Email, dto.FirstName);

            return (200, new { message = "Registered and email sent!" });
        }

        public async Task<object> GetAllRegistrations(int page, int pageSize)
            => await _repo.GetPaginatedRegistrations(page, pageSize);

        public async Task<(int StatusCode, object? Data)> UpdatePaymentStatus(int id, PaymentStatusUpdateDto dto)
            => await _repo.UpdatePaymentStatus(id, dto.PaymentStatus)
                ? (200, new { message = "Updated successfully" })
                : (500, new { message = "Failed to update" });

        public async Task<object> CheckEmailExists(string email)
            => new { exists = await _repo.CheckEmailExists(email) };

        public async Task<object> GetFilteredRegistrations(RegistrationFilterDto filter)
            => await _repo.FilterRegistrations(filter);
    }

}
