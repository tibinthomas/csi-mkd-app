using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories;

/// <summary>
/// Repository interface for QuestionAnswers Cosmos DB operations
/// </summary>
public interface IQuestionAnswersRepository
{
    /// <summary>
    /// Creates new questionnaire answers
    /// </summary>
    Task<QuestionAnswers> CreateAsync(QuestionAnswers questionAnswers);

    /// <summary>
    /// Gets questionnaire answers by registration ID
    /// </summary>
    Task<QuestionAnswers?> GetByRegistrationIdAsync(Guid premaritalRegistrationId);

    /// <summary>
    /// Gets questionnaire answers by document ID
    /// </summary>
    Task<QuestionAnswers?> GetByIdAsync(string id);

    /// <summary>
    /// Updates existing questionnaire answers
    /// </summary>
    Task<QuestionAnswers> UpdateAsync(QuestionAnswers questionAnswers);

    /// <summary>
    /// Deletes questionnaire answers by document ID
    /// </summary>
    Task DeleteAsync(string id);

    /// <summary>
    /// Gets all questionnaire answers with pagination
    /// </summary>
    Task<IEnumerable<QuestionAnswers>> GetAllAsync(int skip = 0, int take = 100);

    /// <summary>
    /// Checks if questionnaire answers exist for a registration
    /// </summary>
    Task<bool> ExistsForRegistrationAsync(Guid premaritalRegistrationId);
}