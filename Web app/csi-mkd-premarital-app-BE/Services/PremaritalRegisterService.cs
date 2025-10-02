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

            return (200, new { message = "Registered!", id = registerId });
        }

        // NEW: Upsert method for files
        public async Task<(int StatusCode, object Data)> UpsertFiles(PremaritalDocumentDto dto)
        {
            if (dto == null) return (400, new { message = "Invalid input" });

            var entity = new PremaritalDocument
            {
                RegistrationId = dto.RegistrationId,
                PhotoUrl = dto.PhotoUrl,
                VicarLetterUrl = dto.VicarLetterUrl,
                SubmittedAt = DateTime.UtcNow
            };

            var isNew = await _repo.UpsertPremaritalFilesAsync(entity);

            // Send email only if new
            if (isNew)
            {
                var registration = await _repo.GetRegistrationById(dto.RegistrationId);
                if (registration != null)
                    _emailService.SendConfirmationEmail(registration.Email, registration.FirstName);

                return (200, new { message = "Files saved!" });
            }

            return (200, new { message = "Files updated!" });
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
            => await _repo.GetTotalRegistrations();

        public async Task<PremaritalRegistration?> GetRegistrationById(Guid id)
            => await _repo.GetRegistrationById(id);

        public async Task<bool> DeleteRegistration(Guid id)
            => await _repo.DeleteRegistration(id);

        public async Task<bool> UpdateRegistration(Guid id, UpdatePremaritalRegisterDto dto)
            => await _repo.UpdateRegistration(id, dto);

        public async Task<PremaritalDocument?> GetPremaritalFilesByRegistrationId(Guid registrationId)
            => await _repo.GetPremaritalFilesByRegistrationId(registrationId);

        public async Task<string> GenerateVcfFile(RegistrationFilterDto filter)
        {
            var registrations = await _repo.FilterRegistrationsForVcf(filter);
            var vcfBuilder = new System.Text.StringBuilder();

            foreach (var registration in registrations)
            {
                vcfBuilder.AppendLine("BEGIN:VCARD");
                vcfBuilder.AppendLine("VERSION:3.0");
                vcfBuilder.AppendLine($"N: {registration.LastName};{registration.FirstName};{registration.SessionConfiguration?.SessionName};;");
                vcfBuilder.AppendLine($"FN:{registration.FirstName} - {registration.SessionConfiguration?.SessionName}");
                vcfBuilder.AppendLine($"TEL;TYPE=CELL:{registration.Phone}");
                vcfBuilder.AppendLine("END:VCARD");
            }

            return vcfBuilder.ToString();
        }
    }
}
