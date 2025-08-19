using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace csi_mkd_premarital_app_BE.Models;

public class ConfirmationDocument
{
    [Key]
    [ForeignKey("ConfirmationRegistration")]
    public Guid RegistrationId { get; set; } // Primary Key and FK

    [Required]
    public required string VicarLetterUrl { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public ConfirmationRegistration? ConfirmationRegistration { get; set; }

}