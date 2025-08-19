
using System.ComponentModel.DataAnnotations;
namespace csi_mkd_premarital_app_BE.DTOs;

public class PremaritalDocumentDto
{
    [Required]
    public Guid RegistrationId { get; set; } // Primary Key and FK

    [Required, Url]
    public required string PhotoUrl { get; set; } = string.Empty;

    [Required, Url]
    public required string VicarLetterUrl { get; set; } = string.Empty;
}
