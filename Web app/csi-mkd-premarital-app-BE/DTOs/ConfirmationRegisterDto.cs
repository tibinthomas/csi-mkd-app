
using System.ComponentModel.DataAnnotations;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;

public class ConfirmationRegisterDto
{
    [Range(1, 300)]
    public int? ChurchId { get; set; }
    public string? PriestName { get; set; }
    public DateTime ConfirmationDate { get; set; }
    public DateTime CounsellingDate { get; set; }
    public List<ParticipantDto> Participants { get; set; } = new();
    public bool Consent { get; set; }
    public required string RecaptchaToken { get; set; } // Added for reCAPTCHA verification
}
