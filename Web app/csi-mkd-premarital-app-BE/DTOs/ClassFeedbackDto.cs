using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class ClassFeedbackDto
    {
        [Required]
        public Guid PremaritalRegistrationId { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Dictionary<string, ClassFeedbackDetailDto> Feedbacks { get; set; } = new();
    }

    public class ClassFeedbackDetailDto
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int InstructorId { get; set; }

        [Required]
        public ClassFeedbackRatingsDto Ratings { get; set; } = new();

        [Required]
        public ClassFeedbackTextResponsesDto TextResponses { get; set; } = new();
    }

    public class ClassFeedbackRatingsDto
    {
        [Required]
        [Range(1, 5)]
        public int Quality { get; set; }

        [Required]
        [Range(1, 5)]
        public int Relevance { get; set; }

        [Required]
        [Range(1, 5)]
        public int Engagement { get; set; }

        [Required]
        [Range(1, 5)]
        public int Organization { get; set; }
    }

    public class ClassFeedbackTextResponsesDto
    {
        public string Comments { get; set; } = string.Empty;
        public string Improvements { get; set; } = string.Empty;
        public string Valuable { get; set; } = string.Empty;
    }

    public class ClassFeedbackResponseDto
    {
        public int Id { get; set; }
        public Guid PremaritalRegistrationId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public Dictionary<string, ClassFeedbackDetailDto> Feedbacks { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }


    // DTO for getting feedback for a specific class
    public class ClassSpecificFeedbackDto
    {
        public int ClassId { get; set; }
        public ClassFeedbackDetailDto? FeedbackDetail { get; set; }
        public bool HasFeedback { get; set; }
    }

    // DTO for analytics data
    public class ClassFeedbackAnalyticsDto
    {
        public Dictionary<int, double> AverageRatingsByClass { get; set; } = new();
        public int TotalFeedbackCount { get; set; }
        public double OverallAverageRating { get; set; }
        public List<ClassFeedbackResponseDto> RecentFeedback { get; set; } = new();
        public Dictionary<string, int> FeedbackByMonth { get; set; } = new();
    }
}
