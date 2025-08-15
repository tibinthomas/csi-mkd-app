using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.Models
{
    public class ClassFeedback
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClassId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required, Range(1, 5)]
        public int QualityRating { get; set; }

        [Required, Range(1, 5)]
        public int RelevanceRating { get; set; }

        [Required, Range(1, 5)]
        public int EngagementRating { get; set; }

        [Required, Range(1, 5)]
        public int OrganizationRating { get; set; }

        public string? Valuable { get; set; }
        public string? Improvements { get; set; }
        public string? Comments { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Foreign key to PremaritalRegistration
        [ForeignKey("PremaritalRegistration")]
        public required int PremaritalRegistrationId { get; set; }

        public PremaritalRegistration? PremaritalRegistration { get; set; }
    }
}
