using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.Models
{
    public class ClassFeedback : BaseEntity
    {
        [Required]
        public Guid PremaritalRegistrationId { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Collection of individual feedback entries for each class
        // For CosmosDB, we store as a collection to get native JSON structure
        public List<ClassFeedbackEntry> FeedbackEntries { get; set; } = [];
        
        // Dictionary property for backward compatibility and easier access
        [System.Text.Json.Serialization.JsonIgnore]
        public Dictionary<string, ClassFeedbackDetail> Feedbacks 
        {
            get => FeedbackEntries.ToDictionary(e => e.ClassId, e => e.Detail);
            set => FeedbackEntries = value.Select(kvp => new ClassFeedbackEntry 
            { 
                ClassId = kvp.Key, 
                Detail = kvp.Value 
            }).ToList();
        }

        // Helper method to get feedback for a specific class
        public ClassFeedbackDetail? GetFeedbackForClass(int classId)
        {
            return Feedbacks.TryGetValue(classId.ToString(), out var feedback) ? feedback : null;
        }

        // Helper method to set feedback for a specific class
        public void SetFeedbackForClass(int classId, ClassFeedbackDetail feedbackDetail)
        {
            Feedbacks[classId.ToString()] = feedbackDetail;
            UpdatedAt = DateTime.UtcNow;
        }

        // Helper method to remove feedback for a specific class
        public bool RemoveFeedbackForClass(int classId)
        {
            var removed = Feedbacks.Remove(classId.ToString());
            if (removed)
            {
                UpdatedAt = DateTime.UtcNow;
            }
            return removed;
        }

        // Foreign key to PremaritalRegistration
        [ForeignKey("PremaritalRegistrationId")]
        public PremaritalRegistration? PremaritalRegistration { get; set; }
    }

    public class ClassFeedbackEntry
    {
        [Required]
        public string ClassId { get; set; } = string.Empty;
        
        [Required] 
        public ClassFeedbackDetail Detail { get; set; } = new();
    }

    public class ClassFeedbackDetail
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int InstructorId { get; set; }

        [Required]
        public ClassFeedbackRatings Ratings { get; set; } = new();

        public ClassFeedbackTextResponses TextResponses { get; set; } = new();
    }

    public class ClassFeedbackRatings
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

    public class ClassFeedbackTextResponses
    {
        public string Comments { get; set; } = string.Empty;
        public string Improvements { get; set; } = string.Empty;
        public string Valuable { get; set; } = string.Empty;
    }
}
