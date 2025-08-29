using csi_mkd_premarital_app_BE.DTOs;

namespace csi_mkd_premarital_app_BE.Services;

/// <summary>
/// Service interface for QuestionAnswers business logic
/// </summary>
public interface IQuestionAnswersService
{
    /// <summary>
    /// Creates new questionnaire answers
    /// </summary>
    Task<QuestionAnswersResponseDto> CreateAsync(CreateQuestionAnswersDto createDto, string? ipAddress = null, string? userAgent = null);

    /// <summary>
    /// Gets questionnaire answers by registration ID
    /// </summary>
    Task<QuestionAnswersResponseDto?> GetByRegistrationIdAsync(Guid premaritalRegistrationId);

    /// <summary>
    /// Gets questionnaire answers by document ID
    /// </summary>
    Task<QuestionAnswersResponseDto?> GetByIdAsync(string id);

    /// <summary>
    /// Updates existing questionnaire answers
    /// </summary>
    Task<QuestionAnswersResponseDto?> UpdateAsync(string id, UpdateQuestionAnswersDto updateDto);

    /// <summary>
    /// Deletes questionnaire answers by document ID
    /// </summary>
    Task<bool> DeleteAsync(string id);

    /// <summary>
    /// Gets all questionnaire answers with pagination
    /// </summary>
    Task<IEnumerable<QuestionAnswersResponseDto>> GetAllAsync(int page = 1, int pageSize = 50);

    /// <summary>
    /// Checks if questionnaire answers exist for a registration
    /// </summary>
    Task<bool> ExistsForRegistrationAsync(Guid premaritalRegistrationId);
}