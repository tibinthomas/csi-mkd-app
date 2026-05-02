using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.Models;

/// <summary>
/// Model to store premarital counseling questionnaire answers in Cosmos DB.
/// Each instance represents a complete set of answers for one registration.
/// </summary>
public class QuestionAnswers
{
    /// <summary>
    /// Unique identifier for this questionnaire response document
    /// </summary>
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Foreign key reference to the PostgreSQL PremaritalRegistration
    /// </summary>
    [Required]
    public required Guid PremaritalRegistrationId { get; set; }

    /// <summary>
    /// Answer to: "What is your definition of marriage?"
    /// </summary>
    [StringLength(2000)]
    public string? DefinitionOfMarriage { get; set; }

    /// <summary>
    /// Answer to: "What are your wishes and concerns about marriage?"
    /// </summary>
    [StringLength(2000)]
    public string? WishesConcerns { get; set; }

    /// <summary>
    /// Answer to: "How important is church in your relationship?"
    /// </summary>
    [StringLength(2000)]
    public string? ChurchImportance { get; set; }

    /// <summary>
    /// Answer to: "Describe your family background"
    /// </summary>
    [StringLength(2000)]
    public string? FamilyBackground { get; set; }

    /// <summary>
    /// Answer to: "How do your parents' health issues impact your relationship?"
    /// </summary>
    [StringLength(2000)]
    public string? ParentsHealthImpact { get; set; }

    /// <summary>
    /// Answer to: "How do you handle being eldest/youngest in your family scenarios?"
    /// </summary>
    [StringLength(2000)]
    public string? EldestYoungestScenario { get; set; }

    /// <summary>
    /// Answer to: "What are your expectations from your partner?"
    /// </summary>
    [StringLength(2000)]
    public string? ExpectationsFromPartner { get; set; }

    /// <summary>
    /// Answer to: "What is your understanding about sex in marriage?"
    /// </summary>
    [StringLength(2000)]
    public string? UnderstandingAboutSex { get; set; }

    /// <summary>
    /// Answer to: "What are your fears about marriage?"
    /// </summary>
    [StringLength(2000)]
    public string? FearsAboutMarriage { get; set; }

    /// <summary>
    /// Answer to: "How much time do you spend with your partner?"
    /// </summary>
    [StringLength(2000)]
    public string? TimeWithPartner { get; set; }

    /// <summary>
    /// Answer to: "How does age difference impact your relationship?"
    /// </summary>
    [StringLength(2000)]
    public string? AgeDifferenceImpact { get; set; }

    /// <summary>
    /// Answer to: "How is your relationship with parents and in-laws?"
    /// </summary>
    [StringLength(2000)]
    public string? RelationshipWithParentsInlaws { get; set; }

    /// <summary>
    /// Answer to: "What would be your greatest adjustment in marriage?"
    /// </summary>
    [StringLength(2000)]
    public string? GreatestAdjustment { get; set; }

    /// <summary>
    /// Timestamp when the questionnaire was submitted
    /// </summary>
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the questionnaire was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Document version for schema evolution
    /// </summary>
    [StringLength(20)]
    public string Version { get; set; } = "1.0";

    /// <summary>
    /// IP address of the submitter for audit purposes
    /// </summary>
    [StringLength(45)]
    public string? SubmitterIpAddress { get; set; }

    /// <summary>
    /// User agent of the submitter for audit purposes
    /// </summary>
    [StringLength(500)]
    public string? SubmitterUserAgent { get; set; }
}