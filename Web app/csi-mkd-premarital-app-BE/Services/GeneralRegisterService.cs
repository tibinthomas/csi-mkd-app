using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Repositories;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Services;

public class GeneralRegisterService : IGeneralRegisterService
{
    private readonly IGeneralRegisterRepository _repo;
    private readonly IWebHostEnvironment _env;
    private readonly EmailService _emailService;

    public GeneralRegisterService(IGeneralRegisterRepository repo, IWebHostEnvironment env, EmailService emailService)
    {
        _repo = repo;
        _env = env;
        _emailService = emailService;
    }

    public async Task<(int StatusCode, object Data)> Register(GeneralRegisterDto dto)
    {
        var entity = new GeneralRegistration
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
            Phone = dto.Phone,
            Email = dto.Email,
            MaritalStatus = dto.MaritalStatus,
            SessionType = dto.SessionType,
            Declaration = dto.Declaration,

        };

        var registerId = await _repo.AddRegistration(entity);
        _emailService.SendConfirmationEmail(dto.Email, dto.FirstName);

        return (200, new { message = "Registered and email sent!", id = registerId });
    }

    public async Task<(int StatusCode, object Data)> SaveFiles(GeneralDocumentDto dto)
    {
        if (dto == null) return (400, new { message = "Invalid input" });
        var entity = new GeneralDocument
        {
            RegistrationId = dto.RegistrationId,
            PhotoUrl = dto.PhotoUrl,
            SubmittedAt = DateTime.UtcNow
        };

        await _repo.AddGeneralFiles(entity);

        return (200, new { message = "Files uploaded!" });

    }
    public async Task<object> CheckEmailExists(string email)
          => new { exists = await _repo.CheckEmailExists(email) };

    public async Task<(int StatusCode, object? Data)> UpdatePaymentStatus(int id, PaymentStatusUpdateDto dto)
           => await _repo.UpdatePaymentStatus(id, dto.PaymentStatus)
               ? (200, new { message = "Updated successfully" })
               : (500, new { message = "Failed to update" });

    public async Task<object> GetFilteredRegistrations(GeneralRegisterFilterDto filter)
               => await _repo.FilterRegistrations(filter);
}