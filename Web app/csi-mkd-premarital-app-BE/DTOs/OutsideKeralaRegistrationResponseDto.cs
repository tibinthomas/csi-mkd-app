using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class OutsideKeralaRegistrationResponseDto
    {
        public Guid Id { get; set; }
        public int? ChurchId { get; set; }
        public DateTimeOffset SessionStartDateUtc { get; set; }
        public DateTimeOffset SessionEndDateUtc { get; set; }
        public DateTimeOffset SessionStartDateLocal { get; set; }
        public DateTimeOffset SessionEndDateLocal { get; set; }
        public string? PriestName { get; set; }
        public TimeZoneOption? TimeZone { get; set; }
        public DateTime SubmittedAt { get; set; }
        public ICollection<ParticipantOutsideKeralaResponseDto>? Participants { get; set; }
        public PremaritalOutsideKeralaDocumentResponseDto? Document { get; set; }
    }

    public class ParticipantOutsideKeralaResponseDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public DateTime SubmittedAt { get; set; }
    }

    public class PremaritalOutsideKeralaDocumentResponseDto
    {
        public Guid RegistrationId { get; set; }
        public string? VicarLetterUrl { get; set; }
        public DateTime SubmittedAt { get; set; }
    }
}
