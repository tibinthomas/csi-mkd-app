using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class ParticipantOutsideKeralaDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }

    public class PremaritalOutsideKeralaRegisterDto
    {
        public int? ChurchId { get; set; }
        
        [Required]
        public string SessionStartDate { get; set; } = string.Empty;
        
        [Required]
        public string SessionEndDate { get; set; } = string.Empty;

        public string? PriestName { get; set; }

        [Required]
        public TimeZoneOption? TimeZone { get; set; }

        
        [Required]
        public List<ParticipantOutsideKeralaDto> Participants { get; set; } = new();
    }

    public class PremaritalOutsideKeralaDocumentDto
    {
        [Required]
        public Guid RegistrationId { get; set; }
        
        // This will be handled as FromForm file in the endpoint
        // But we keep the string property for URL persistence after processing
        public string? VicarLetterUrl { get; set; }
    }
}
