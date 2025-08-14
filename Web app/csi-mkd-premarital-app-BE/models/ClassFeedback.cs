using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.Models
{
    public class ClassFeedback
    {
        public int Id { get; set; }

        [Required]
        public required string ClassTitle { get; set; }
        [Required]
        public required string FirstName { get; set; }
        [Required]
        public required string LastName { get; set; }
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [Range(1, 5)]
        public int QualityRating { get; set; }
        [Required]
        [Range(1, 5)]
        public int RelevanceRating { get; set; }
        [Required]
        [Range(1, 5)]
        public int EngagementRating { get; set; }
        [Required]
        [Range(1, 5)]
        public int OrganizationRating { get; set; }

        public string? Valuable { get; set; }
        public string? Improvements { get; set; }
        public string? Comments { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        // public byte[] RowVersion { get; set; } = default!;

    }
}
