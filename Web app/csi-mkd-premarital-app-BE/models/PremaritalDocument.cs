using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.Models
{
    public class PremaritalDocument
    {
        [Key]
        [ForeignKey("PremaritalRegistration")]
        public int RegistrationId { get; set; } // Primary Key and FK

        [Required]
        public required string PhotoUrl { get; set; } = string.Empty;

        [Required]
        public required string VicarLetterUrl { get; set; } = string.Empty;

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public PremaritalRegistration? PremaritalRegistration { get; set; }
    }
}
