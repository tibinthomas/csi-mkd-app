using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.Models
{
    public class PremaritalOutsideKeralaDocument
    {
        [Key]
        public Guid RegistrationId { get; set; }

        [StringLength(500)]
        public string? VicarLetterUrl { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(RegistrationId))]
        public PremaritalOutsideKeralaRegistration? PremaritalOutsideKeralaRegistration { get; set; }
    }
}
