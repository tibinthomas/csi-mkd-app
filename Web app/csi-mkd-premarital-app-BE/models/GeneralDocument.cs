using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace csi_mkd_premarital_app_BE.Models;

public class GeneralDocument
{
    [Key]
    [ForeignKey("GeneralRegistration")]
    public int RegistrationId { get; set; } // Primary Key and FK

    [Required]
    public required string PhotoUrl { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public GeneralRegistration? GeneralRegistration { get; set; }

}