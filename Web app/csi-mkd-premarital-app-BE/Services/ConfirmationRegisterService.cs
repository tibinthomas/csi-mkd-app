using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;
using csi_mkd_premarital_app_BE.Services;

public class ConfirmationRegisterService : IConfirmationRegisterService
{
    private readonly IConfirmationRegisterRepository _repository;
    public ConfirmationRegisterService(IConfirmationRegisterRepository repository)
    {
        _repository = repository;
    }

    public async Task<(int StatusCode, object Data)> Register(ConfirmationRegisterDto dto)
    {
        // Logic to register confirmation
        var registration = new ConfirmationRegistration
        {
            ChurchName = dto.ChurchName,
            ConfirmationDate = dto.ConfirmationDate,
            ConfirmationTime = dto.ConfirmationTime,
            Participants = dto.Participants.Select(p => new Participant
            {
                Name = p.Name,
                Age = p.Age
            }).ToList(),
            Consent = dto.Consent,

        };

        int id = await _repository.AddRegistration(registration);
        return (201, new { Id = id });
    }

    public async Task<(int StatusCode, object Data)> SaveFiles(ConfirmationDocumentDto dto)
    {
        // Logic to save confirmation files
        var documents = new ConfirmationDocument
        {
            RegistrationId = dto.RegistrationId,
            VicarLetterUrl = dto.VicarLetterUrl,
            // Map other properties as needed
        };

        await _repository.AddConfirmationFiles(documents);

        return (200, new { Message = "Files saved successfully" });
    }

    public async Task<object> GetFilteredRegistrations(ConfirmationRegisterFilterDto filter)
    {
        // Logic to filter registrations
        return await _repository.FilterRegistrations(filter);
    }

}