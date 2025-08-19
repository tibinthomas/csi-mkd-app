using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace csi_mkd_premarital_app_BE.DTOs;

public class ConfirmationDocumentDto
{
    public Guid RegistrationId { get; set; } // Primary Key and FK
    public required string VicarLetterUrl { get; set; } = string.Empty;


}