using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class ClassFeedbackDto
    {
        public int ClassId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public int QualityRating { get; set; }
        public int RelevanceRating { get; set; }
        public int EngagementRating { get; set; }
        public int OrganizationRating { get; set; }

        public string? Valuable { get; set; }
        public string? Improvements { get; set; }
        public string? Comments { get; set; }
        public int PremaritalRegistrationId { get; set; }
    }
}
