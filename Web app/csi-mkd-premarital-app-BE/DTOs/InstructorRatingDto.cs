namespace csi_mkd_premarital_app_BE.DTOs
{
    public class InstructorRatingDto
    {
        public int InstructorId { get; set; }
        public string InstructorName { get; set; } = string.Empty;
        public string Qualification { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalFeedbackCount { get; set; }
        public InstructorRatingBreakdownDto RatingBreakdown { get; set; } = new();
    }

    public class InstructorRatingBreakdownDto
    {
        public double AverageQuality { get; set; }
        public double AverageRelevance { get; set; }
        public double AverageEngagement { get; set; }
        public double AverageOrganization { get; set; }
    }
}