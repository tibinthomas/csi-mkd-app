using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;

namespace csi_mkd_premarital_app_BE.Services;

/// <summary>
/// Service implementation for QuestionAnswers business logic
/// </summary>
public class QuestionAnswersService : IQuestionAnswersService
{
    private readonly IQuestionAnswersRepository _repository;
    private readonly ILogger<QuestionAnswersService> _logger;

    public QuestionAnswersService(IQuestionAnswersRepository repository, ILogger<QuestionAnswersService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<QuestionAnswersResponseDto> CreateAsync(CreateQuestionAnswersDto createDto, string? ipAddress = null, string? userAgent = null)
    {
        try
        {
            // Check if answers already exist for this registration
            var existingAnswers = await _repository.GetByRegistrationIdAsync(createDto.PremaritalRegistrationId);
            if (existingAnswers != null)
            {
                throw new InvalidOperationException($"Questionnaire answers already exist for registration {createDto.PremaritalRegistrationId}");
            }

            var questionAnswers = new QuestionAnswers
            {
                PremaritalRegistrationId = createDto.PremaritalRegistrationId,
                DefinitionOfMarriage = createDto.DefinitionOfMarriage,
                WishesConcerns = createDto.WishesConcerns,
                ChurchImportance = createDto.ChurchImportance,
                FamilyBackground = createDto.FamilyBackground,
                ParentsHealthImpact = createDto.ParentsHealthImpact,
                EldestYoungestScenario = createDto.EldestYoungestScenario,
                ExpectationsFromPartner = createDto.ExpectationsFromPartner,
                UnderstandingAboutSex = createDto.UnderstandingAboutSex,
                FearsAboutMarriage = createDto.FearsAboutMarriage,
                TimeWithPartner = createDto.TimeWithPartner,
                AgeDifferenceImpact = createDto.AgeDifferenceImpact,
                RelationshipWithParentsInlaws = createDto.RelationshipWithParentsInlaws,
                GreatestAdjustment = createDto.GreatestAdjustment,
                SubmittedAt = DateTime.UtcNow,
                SubmitterIpAddress = ipAddress,
                SubmitterUserAgent = userAgent
            };

            var createdAnswers = await _repository.CreateAsync(questionAnswers);
            
            _logger.LogInformation("Created questionnaire answers for registration {RegistrationId}", 
                createDto.PremaritalRegistrationId);

            return MapToResponseDto(createdAnswers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating questionnaire answers for registration {RegistrationId}", 
                createDto.PremaritalRegistrationId);
            throw;
        }
    }

    public async Task<QuestionAnswersResponseDto?> GetByRegistrationIdAsync(Guid premaritalRegistrationId)
    {
        try
        {
            var questionAnswers = await _repository.GetByRegistrationIdAsync(premaritalRegistrationId);
            return questionAnswers != null ? MapToResponseDto(questionAnswers) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting questionnaire answers for registration {RegistrationId}", 
                premaritalRegistrationId);
            throw;
        }
    }

    public async Task<QuestionAnswersResponseDto?> GetByIdAsync(string id)
    {
        try
        {
            var questionAnswers = await _repository.GetByIdAsync(id);
            return questionAnswers != null ? MapToResponseDto(questionAnswers) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting questionnaire answers by ID {Id}", id);
            throw;
        }
    }

    public async Task<QuestionAnswersResponseDto?> UpdateAsync(string id, UpdateQuestionAnswersDto updateDto)
    {
        try
        {
            var existingAnswers = await _repository.GetByIdAsync(id);
            if (existingAnswers == null)
            {
                return null;
            }

            // Update only provided fields
            if (updateDto.DefinitionOfMarriage != null)
                existingAnswers.DefinitionOfMarriage = updateDto.DefinitionOfMarriage;
            if (updateDto.WishesConcerns != null)
                existingAnswers.WishesConcerns = updateDto.WishesConcerns;
            if (updateDto.ChurchImportance != null)
                existingAnswers.ChurchImportance = updateDto.ChurchImportance;
            if (updateDto.FamilyBackground != null)
                existingAnswers.FamilyBackground = updateDto.FamilyBackground;
            if (updateDto.ParentsHealthImpact != null)
                existingAnswers.ParentsHealthImpact = updateDto.ParentsHealthImpact;
            if (updateDto.EldestYoungestScenario != null)
                existingAnswers.EldestYoungestScenario = updateDto.EldestYoungestScenario;
            if (updateDto.ExpectationsFromPartner != null)
                existingAnswers.ExpectationsFromPartner = updateDto.ExpectationsFromPartner;
            if (updateDto.UnderstandingAboutSex != null)
                existingAnswers.UnderstandingAboutSex = updateDto.UnderstandingAboutSex;
            if (updateDto.FearsAboutMarriage != null)
                existingAnswers.FearsAboutMarriage = updateDto.FearsAboutMarriage;
            if (updateDto.TimeWithPartner != null)
                existingAnswers.TimeWithPartner = updateDto.TimeWithPartner;
            if (updateDto.AgeDifferenceImpact != null)
                existingAnswers.AgeDifferenceImpact = updateDto.AgeDifferenceImpact;
            if (updateDto.RelationshipWithParentsInlaws != null)
                existingAnswers.RelationshipWithParentsInlaws = updateDto.RelationshipWithParentsInlaws;
            if (updateDto.GreatestAdjustment != null)
                existingAnswers.GreatestAdjustment = updateDto.GreatestAdjustment;

            var updatedAnswers = await _repository.UpdateAsync(existingAnswers);
            
            _logger.LogInformation("Updated questionnaire answers {Id}", id);

            return MapToResponseDto(updatedAnswers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating questionnaire answers {Id}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        try
        {
            var existingAnswers = await _repository.GetByIdAsync(id);
            if (existingAnswers == null)
            {
                return false;
            }

            await _repository.DeleteAsync(id);
            
            _logger.LogInformation("Deleted questionnaire answers {Id}", id);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting questionnaire answers {Id}", id);
            throw;
        }
    }

    public async Task<IEnumerable<QuestionAnswersResponseDto>> GetAllAsync(int page = 1, int pageSize = 50)
    {
        try
        {
            var skip = (page - 1) * pageSize;
            var questionAnswers = await _repository.GetAllAsync(skip, pageSize);
            
            return questionAnswers.Select(MapToResponseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all questionnaire answers");
            throw;
        }
    }

    public async Task<bool> ExistsForRegistrationAsync(Guid premaritalRegistrationId)
    {
        try
        {
            return await _repository.ExistsForRegistrationAsync(premaritalRegistrationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking existence of questionnaire answers for registration {RegistrationId}", 
                premaritalRegistrationId);
            throw;
        }
    }

    private static QuestionAnswersResponseDto MapToResponseDto(QuestionAnswers questionAnswers)
    {
        return new QuestionAnswersResponseDto
        {
            Id = questionAnswers.Id,
            PremaritalRegistrationId = questionAnswers.PremaritalRegistrationId,
            DefinitionOfMarriage = questionAnswers.DefinitionOfMarriage,
            WishesConcerns = questionAnswers.WishesConcerns,
            ChurchImportance = questionAnswers.ChurchImportance,
            FamilyBackground = questionAnswers.FamilyBackground,
            ParentsHealthImpact = questionAnswers.ParentsHealthImpact,
            EldestYoungestScenario = questionAnswers.EldestYoungestScenario,
            ExpectationsFromPartner = questionAnswers.ExpectationsFromPartner,
            UnderstandingAboutSex = questionAnswers.UnderstandingAboutSex,
            FearsAboutMarriage = questionAnswers.FearsAboutMarriage,
            TimeWithPartner = questionAnswers.TimeWithPartner,
            AgeDifferenceImpact = questionAnswers.AgeDifferenceImpact,
            RelationshipWithParentsInlaws = questionAnswers.RelationshipWithParentsInlaws,
            GreatestAdjustment = questionAnswers.GreatestAdjustment,
            SubmittedAt = questionAnswers.SubmittedAt,
            UpdatedAt = questionAnswers.UpdatedAt,
            Version = questionAnswers.Version
        };
    }
}