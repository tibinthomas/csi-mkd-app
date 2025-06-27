namespace csi_mkd_premarital_app_BE.Models
{
    public class SessionFeedback
    {
        public int Id { get; set; }

        public required string SessionTitle { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public DateTime Date { get; set; }

        public int QualityRating { get; set; }
        public int RelevanceRating { get; set; }
        public int EngagementRating { get; set; }
        public int OrganizationRating { get; set; }

        public string? Valuable { get; set; }
        public string? Improvements { get; set; }
        public string? Comments { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}
