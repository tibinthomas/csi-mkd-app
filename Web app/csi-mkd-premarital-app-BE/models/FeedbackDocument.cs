using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.Models
{
    public class FeedbackDocument
    {
        public string id { get; set; } = Guid.NewGuid().ToString();
        public string PartitionKey { get; set; } = string.Empty;
        
        [Required]
        public int ClassId { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        [Required]
        public FeedbackRatings Ratings { get; set; } = new();
        
        public FeedbackText TextResponses { get; set; } = new();
        
        [Required]
        public FeedbackMetadata Metadata { get; set; } = new();
        
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        
        // Auto-generate partition key based on date (YYYY-MM format)
        public void SetPartitionKey()
        {
            PartitionKey = Date.ToString("yyyy-MM");
        }
    }

    public class FeedbackRatings
    {
        [Required, Range(1, 5)]
        public int Quality { get; set; }
        
        [Required, Range(1, 5)]
        public int Relevance { get; set; }
        
        [Required, Range(1, 5)]
        public int Engagement { get; set; }
        
        [Required, Range(1, 5)]
        public int Organization { get; set; }
        
        // Calculated average rating
        public double Average => (Quality + Relevance + Engagement + Organization) / 4.0;
    }

    public class FeedbackText
    {
        public string? Valuable { get; set; }
        public string? Improvements { get; set; }
        public string? Comments { get; set; }
        
        // Calculated fields for analytics
        public int TotalCharacters => (Valuable?.Length ?? 0) + (Improvements?.Length ?? 0) + (Comments?.Length ?? 0);
        public bool HasDetailedFeedback => TotalCharacters > 50;
    }

    public class FeedbackMetadata
    {
        [Required]
        public int PremaritalRegistrationId { get; set; }
        
        public string? SessionTitle { get; set; }
        public string? InstructorName { get; set; }
        public int? SessionDuration { get; set; } // Duration in minutes
        public string? Location { get; set; }
        
        // Analytics metadata
        public string UserAgent { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Version { get; set; } = "1.0";
        
        // Feedback source tracking
        public string Source { get; set; } = "web"; // web, mobile, api
        public string Platform { get; set; } = string.Empty;
    }
}