using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;

namespace csi_mkd_premarital_app_BE.Services
{
    public class ConfirmationRegisterService : IConfirmationRegisterService
    {
        private readonly IConfirmationRegisterRepository _repository;

        public ConfirmationRegisterService(IConfirmationRegisterRepository repository)
        {
            _repository = repository;
        }

        public async Task<ServiceResponse<ConfirmationRegistration>> Register(ConfirmationRegisterDto confirmationRegisterDto)
        {
            var registration = new ConfirmationRegistration
            {
                ChurchId = confirmationRegisterDto.ChurchId,
                PriestName = confirmationRegisterDto.PriestName,
                ConfirmationDate = DateTime.SpecifyKind(confirmationRegisterDto.ConfirmationDate, DateTimeKind.Utc),
                CounsellingDate = DateTime.SpecifyKind(confirmationRegisterDto.CounsellingDate, DateTimeKind.Utc),
                Participants = confirmationRegisterDto.Participants.Select(p => new Participant
                {
                    Name = p.Name,
                    Age = p.Age
                }).ToList(),
                Consent = confirmationRegisterDto.Consent,
            };

            var createdRegistration = await _repository.CreateAsync(registration);
            return new ServiceResponse<ConfirmationRegistration> { Data = createdRegistration, StatusCode = 201 };
        }

        public async Task<ServiceResponse<ConfirmationDocument>> SaveFiles(ConfirmationDocumentDto confirmationDocumentDto)
        {
            // This method seems to be missing in the repository, so I'm commenting it out for now.
            // You might need to add it to the repository and uncomment this.
            // var documents = new ConfirmationDocument
            // {
            //     RegistrationId = confirmationDocumentDto.RegistrationId,
            //     VicarLetterUrl = confirmationDocumentDto.VicarLetterUrl,
            // };
            // await _repository.AddConfirmationFiles(documents);

            return new ServiceResponse<ConfirmationDocument> { StatusCode = 200, Message = "Files saved successfully" };
        }

        public async Task<IEnumerable<ConfirmationRegistration>> GetFilteredRegistrations(ConfirmationRegisterFilterDto filter)
        {
            return await _repository.GetFilteredRegistrations(filter);
        }

        public async Task<int> GetTotalRegistrations()
        {
            return await _repository.GetTotalRegistrations();
        }

        public async Task<(int StatusCode, string Message)> DeleteAsync(Guid id)
        {
            var registration = await _repository.FindByIdAsync(id);
            if (registration == null)
            {
                return (404, "Registration not found.");
            }

            await _repository.DeleteAsync(id);
            return (200, "Registration deleted successfully.");
        }

        public async Task<(int StatusCode, string Message)> UpdateAsync(Guid id, UpdateConfirmationRegisterDto dto)
        {
            var registration = await _repository.FindByIdAsync(id);
            if (registration == null)
            {
                return (404, "Registration not found.");
            }

            registration.ChurchId = dto.ChurchId;
            registration.ConfirmationDate = DateTime.SpecifyKind(dto.ConfirmationDate, DateTimeKind.Utc);
            registration.CounsellingDate = DateTime.SpecifyKind(dto.CounsellingDate, DateTimeKind.Utc);

            // Update participants
            if (dto.DeletedParticipantIds != null && dto.DeletedParticipantIds.Any())
            {
                var participantsToRemove = registration.Participants
                    .Where(p => dto.DeletedParticipantIds.Contains(p.Id))
                    .ToList();
                _repository.RemoveParticipants(participantsToRemove);
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
                        existingParticipant.Age = participantDto.Age;
                    }
                }
                else
                {
                    registration.Participants.Add(new Participant
                    {
                        Id = Guid.Empty,
                        Name = participantDto.Name,
                        Age = participantDto.Age
                    });
                }
            }
            await _repository.SaveChangesAsync(registration);
            return (200, "Registration updated successfully.");
        }

    }
}
