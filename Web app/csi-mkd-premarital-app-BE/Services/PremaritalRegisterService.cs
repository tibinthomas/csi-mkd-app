using System.Text.Json;
using TimeZoneConverter;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Helpers;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;
using Microsoft.AspNetCore.Hosting;
using ClosedXML.Excel;
using System.IO;

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

        public async Task<byte[]> GenerateSpreadsheet(PremaritalRegisterSpreadsheetFilterDto filter)
        {
            var registrations = await _repo.FilterRegistrationsForSpreadsheet(filter);

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Registrations");
                worksheet.Cell(1, 1).Value = "Name";
                worksheet.Cell(1, 2).Value = "Church Name";

                var row = 2;
                foreach (var registration in registrations)
                {
                    worksheet.Cell(row, 1).Value = $"{registration.FirstName} {registration.LastName}";
                    worksheet.Cell(row, 2).Value = registration.ChurchName;
                    row++;
                }

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }

        public async Task<(int StatusCode, object Data)> RegisterOutsideKerala(PremaritalOutsideKeralaRegisterDto dto)
        {
            if (dto == null) return (400, new { message = "Invalid input" });
            
            // Ensure TimeZone is present (handled by DTO validation usually, but safe access here)
            if (dto.TimeZone == null) return (400, new { message = "TimeZone is required" });

            // Use the Helper to get UTC range

            var (utcStart, utcEnd) = DateRangeConverter.BuildUtcDateRange(
                dto.SessionStartDate, 
                dto.SessionEndDate, 
                dto.TimeZone.Value.GetIanaId()
            );

            var entity = new PremaritalOutsideKeralaRegistration
            {
                ChurchId = dto.ChurchId,
                SessionStartDate = utcStart,
                SessionEndDate = utcEnd,
                PriestName = dto.PriestName,
                TimeZone = dto.TimeZone,
                Participants = dto.Participants.Select(p => new ParticipantOutsideKerala
                {
                    Name = p.Name,
                    SubmittedAt = DateTime.UtcNow
                }).ToList(),
                SubmittedAt = DateTime.UtcNow
            };

            var registerId = await _repo.AddOutsideKeralaRegistration(entity);

            return (200, new { message = "Registered!", id = registerId });
        }

        public async Task<(int StatusCode, object Data)> UpsertOutsideKeralaFiles(PremaritalOutsideKeralaDocumentDto dto)
        {
            if (dto == null) return (400, new { message = "Invalid input" });

            var entity = new PremaritalOutsideKeralaDocument
            {
                RegistrationId = dto.RegistrationId,
                VicarLetterUrl = dto.VicarLetterUrl,
                SubmittedAt = DateTime.UtcNow
            };

            var isNew = await _repo.UpsertOutsideKeralaFilesAsync(entity);

            return (200, new { message = isNew ? "Files saved!" : "Files updated!" });
        }

        public async Task<PremaritalOutsideKeralaRegistration?> GetOutsideKeralaRegistrationById(Guid id)
            => await _repo.GetOutsideKeralaRegistrationById(id);

        public async Task<bool> DeleteOutsideKeralaRegistration(Guid id)
            => await _repo.DeleteOutsideKeralaRegistration(id);

        public async Task<IEnumerable<PremaritalOutsideKeralaRegistration>> GetAllOutsideKeralaRegistrations()
            => await _repo.GetAllOutsideKeralaRegistrations();

        public async Task<int> GetTotalOutsideKeralaRegistrations()
            => await _repo.GetTotalOutsideKeralaRegistrations();

        public async Task<bool> UpdateOutsideKeralaRegistration(Guid id, PremaritalOutsideKeralaRegisterDto dto)
        {
            if (dto == null || dto.TimeZone == null) return false;

            var registration = await _repo.GetOutsideKeralaRegistrationById(id);
            if (registration == null) return false;

            var (utcStart, utcEnd) = DateRangeConverter.BuildUtcDateRange(
                dto.SessionStartDate, 
                dto.SessionEndDate, 
                dto.TimeZone.Value.GetIanaId()
            );

            registration.ChurchId = dto.ChurchId;
            registration.SessionStartDate = utcStart;
            registration.SessionEndDate = utcEnd;
            registration.PriestName = dto.PriestName;
            registration.TimeZone = dto.TimeZone;

            // Update participants
            if (dto.DeletedParticipantIds != null && dto.DeletedParticipantIds.Any())
            {
                var participantsToRemove = registration.Participants
                    .Where(p => dto.DeletedParticipantIds.Contains(p.Id))
                    .ToList();
                _repo.RemoveParticipantsOutsideKerala(participantsToRemove);
            }

            foreach (var participantDto in dto.Participants)
            {
                if (participantDto.Id.HasValue)
                {
                    var existingParticipant = registration.Participants
                        .FirstOrDefault(p => p.Id == participantDto.Id.Value);

                    if (existingParticipant != null)
                    {
                        existingParticipant.Name = participantDto.Name;
                    }
                }
                else
                {
                    registration.Participants.Add(new ParticipantOutsideKerala
                    {
                        Id = Guid.Empty,
                        Name = participantDto.Name,
                        SubmittedAt = DateTime.UtcNow
                    });
                }
            }

            try
            {
                await _repo.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating outside Kerala registration: {ex.Message}");
                return false;
            }
        }
    }
}
