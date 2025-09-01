using System.Text.Json;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;
using Microsoft.AspNetCore.Hosting;

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

        public async Task<(int StatusCode, object Data)> Register(PremaritalRegisterDto dto)
        {
            if (dto == null) return (400, new { message = "Invalid input" });

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
                ChurchId = dto.ChurchId,
                ChurchName = dto.ChurchName,
                PriestName = dto.PriestName,
                FianceName = dto.FianceName,
                DateOfMarriage = dto.DateOfMarriage.HasValue ? DateTime.SpecifyKind(dto.DateOfMarriage.Value, DateTimeKind.Utc) : null,
                Phone = dto.Phone,
                Email = dto.Email,
                Days = dto.Days,
                ChurchActivitiesJson = JsonSerializer.Serialize(churchActivities),
                Declaration = dto.Declaration,
                SessionId = dto.SessionId,
                PaymentStatus = dto.PaymentStatus,
                SubmittedAt = DateTime.UtcNow
            };

            var registerId = await _repo.AddRegistration(entity);
            _emailService.SendConfirmationEmail(dto.Email, dto.FirstName);

            return (200, new { message = "Registered and email sent!", id = registerId });
        }

        public async Task<(int StatusCode, object Data)> SaveFiles(PremaritalDocumentDto dto)
        {
            if (dto == null) return (400, new { message = "Invalid input" });
            var entity = new PremaritalDocument
            {
                RegistrationId = dto.RegistrationId,
                PhotoUrl = dto.PhotoUrl,
                VicarLetterUrl = dto.VicarLetterUrl,
                SubmittedAt = DateTime.UtcNow
            };

            await _repo.AddPremaritalFiles(entity);

            return (200, new { message = "Files uploaded!" });
        }

        public async Task<(int StatusCode, object? Data)> UpdatePaymentStatus(Guid id, PaymentStatusUpdateDto dto)
            => await _repo.UpdatePaymentStatus(id, dto.PaymentStatus)
                ? (200, new { message = "Updated successfully" })
                : (500, new { message = "Failed to update" });

        public async Task<(bool Exists, Guid? UserId)> CheckEmailExists(string email)
            => await _repo.CheckEmailExists(email);

        public async Task<object> GetFilteredRegistrations(RegistrationFilterDto filter)
            => await _repo.FilterRegistrations(filter);

        public async Task<int> GetTotalRegistrations()
        {
            return await _repo.GetTotalRegistrations();
        }

        public async Task<object?> GetRegistrationById(Guid id)
        {
            return await _repo.GetRegistrationById(id);
        }

        public async Task<bool> DeleteRegistration(Guid id)
        {
            return await _repo.DeleteRegistration(id);
        }

        public async Task<bool> UpdateRegistration(Guid id, UpdatePremaritalRegisterDto dto)
        {
            return await _repo.UpdateRegistration(id, dto);
        }
    }

}
