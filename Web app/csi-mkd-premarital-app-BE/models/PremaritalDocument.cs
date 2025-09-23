using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.Models
{
    public class PremaritalDocument
    {
        [Key]
        [ForeignKey("PremaritalRegistration")]
        public Guid RegistrationId { get; set; } // Primary Key and FK

        public  string? PhotoUrl { get; set; } = string.Empty;

        public  string? VicarLetterUrl { get; set; } = string.Empty;

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public PremaritalRegistration? PremaritalRegistration { get; set; }
    }
}
