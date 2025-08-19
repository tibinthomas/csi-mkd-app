using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class FeedbackDocumentDto
    {
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
        
        [Required]
        public Guid PremaritalRegistrationId { get; set; }
        
        // Optional metadata
        public string? SessionTitle { get; set; }
        public string? InstructorName { get; set; }
        public int? SessionDuration { get; set; }
        public string? Location { get; set; }
        public string? Source { get; set; } = "web";
        public string? Platform { get; set; }
    }

    public class FeedbackResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public int ClassId { get; set; }
        public DateTime Date { get; set; }
        public FeedbackRatingsDto Ratings { get; set; } = new();
        public FeedbackTextDto TextResponses { get; set; } = new();
        public FeedbackMetadataDto Metadata { get; set; } = new();
        public DateTime SubmittedAt { get; set; }
    }

    public class FeedbackRatingsDto
    {
        public int Quality { get; set; }
        public int Relevance { get; set; }
        public int Engagement { get; set; }
        public int Organization { get; set; }
        public double Average { get; set; }
    }

    public class FeedbackTextDto
    {
        public string? Valuable { get; set; }
        public string? Improvements { get; set; }
        public string? Comments { get; set; }
        public int TotalCharacters { get; set; }
        public bool HasDetailedFeedback { get; set; }
    }

    public class FeedbackMetadataDto
    {
        public Guid PremaritalRegistrationId { get; set; }
        public string? SessionTitle { get; set; }
        public string? InstructorName { get; set; }
        public int? SessionDuration { get; set; }
        public string? Location { get; set; }
        public string Source { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Version { get; set; } = string.Empty;
    }

    public class FeedbackAnalyticsDto
    {
        public Dictionary<int, double> AverageRatingsByClass { get; set; } = new();
        public long TotalFeedbackCount { get; set; }
        public double OverallAverageRating { get; set; }
        public List<FeedbackResponseDto> RecentFeedback { get; set; } = new();
        public Dictionary<string, int> FeedbackByMonth { get; set; } = new();
    }
}