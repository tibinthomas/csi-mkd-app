using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.DTOs;

/// <summary>
/// DTO for submitting questionnaire answers
/// </summary>
public class CreateQuestionAnswersDto
{
    [Required]
    public required Guid PremaritalRegistrationId { get; set; }

    [StringLength(2000)]
    public string? DefinitionOfMarriage { get; set; }

    [StringLength(2000)]
    public string? WishesConcerns { get; set; }

    [StringLength(2000)]
    public string? ChurchImportance { get; set; }

    [StringLength(2000)]
    public string? FamilyBackground { get; set; }

    [StringLength(2000)]
    public string? ParentsHealthImpact { get; set; }

    [StringLength(2000)]
    public string? EldestYoungestScenario { get; set; }

    [StringLength(2000)]
    public string? ExpectationsFromPartner { get; set; }

    [StringLength(2000)]
    public string? UnderstandingAboutSex { get; set; }

    [StringLength(2000)]
    public string? FearsAboutMarriage { get; set; }

    [StringLength(2000)]
    public string? TimeWithPartner { get; set; }

    [StringLength(2000)]
    public string? AgeDifferenceImpact { get; set; }

    [StringLength(2000)]
    public string? RelationshipWithParentsInlaws { get; set; }

    [StringLength(2000)]
    public string? GreatestAdjustment { get; set; }
}

/// <summary>
/// DTO for updating questionnaire answers
/// </summary>
public class UpdateQuestionAnswersDto
{
    [StringLength(2000)]
    public string? DefinitionOfMarriage { get; set; }

    [StringLength(2000)]
    public string? WishesConcerns { get; set; }

    [StringLength(2000)]
    public string? ChurchImportance { get; set; }

    [StringLength(2000)]
    public string? FamilyBackground { get; set; }

    [StringLength(2000)]
    public string? ParentsHealthImpact { get; set; }

    [StringLength(2000)]
    public string? EldestYoungestScenario { get; set; }

    [StringLength(2000)]
    public string? ExpectationsFromPartner { get; set; }

    [StringLength(2000)]
    public string? UnderstandingAboutSex { get; set; }

    [StringLength(2000)]
    public string? FearsAboutMarriage { get; set; }

    [StringLength(2000)]
    public string? TimeWithPartner { get; set; }

    [StringLength(2000)]
    public string? AgeDifferenceImpact { get; set; }

    [StringLength(2000)]
    public string? RelationshipWithParentsInlaws { get; set; }

    [StringLength(2000)]
    public string? GreatestAdjustment { get; set; }
}

/// <summary>
/// DTO for returning questionnaire answers
/// </summary>
public class QuestionAnswersResponseDto
{
    public required string Id { get; set; }
    public required Guid PremaritalRegistrationId { get; set; }
    public string? DefinitionOfMarriage { get; set; }
    public string? WishesConcerns { get; set; }
    public string? ChurchImportance { get; set; }
    public string? FamilyBackground { get; set; }
    public string? ParentsHealthImpact { get; set; }
    public string? EldestYoungestScenario { get; set; }
    public string? ExpectationsFromPartner { get; set; }
    public string? UnderstandingAboutSex { get; set; }
    public string? FearsAboutMarriage { get; set; }
    public string? TimeWithPartner { get; set; }
    public string? AgeDifferenceImpact { get; set; }
    public string? RelationshipWithParentsInlaws { get; set; }
    public string? GreatestAdjustment { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public required string Version { get; set; }
}