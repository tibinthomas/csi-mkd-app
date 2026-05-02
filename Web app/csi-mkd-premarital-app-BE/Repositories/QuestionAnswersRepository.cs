using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories;

/// <summary>
/// Repository implementation for QuestionAnswers Cosmos DB operations
/// </summary>
public class QuestionAnswersRepository : IQuestionAnswersRepository
{
    private readonly CosmosDbContext _context;
    private readonly ILogger<QuestionAnswersRepository> _logger;

    public QuestionAnswersRepository(CosmosDbContext context, ILogger<QuestionAnswersRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<QuestionAnswers> CreateAsync(QuestionAnswers questionAnswers)
    {
        try
        {
            _context.QuestionAnswers.Add(questionAnswers);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Created questionnaire answers for registration {RegistrationId}", 
                questionAnswers.PremaritalRegistrationId);
            
            return questionAnswers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating questionnaire answers for registration {RegistrationId}", 
                questionAnswers.PremaritalRegistrationId);
            throw;
        }
    }

    public async Task<QuestionAnswers?> GetByRegistrationIdAsync(Guid premaritalRegistrationId)
    {
        try
        {
            return await _context.QuestionAnswers
                .AsNoTracking()
                .FirstOrDefaultAsync(qa => qa.PremaritalRegistrationId == premaritalRegistrationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting questionnaire answers for registration {RegistrationId}", 
                premaritalRegistrationId);
            throw;
        }
    }

    public async Task<QuestionAnswers?> GetByIdAsync(string id)
    {
        try
        {
            return await _context.QuestionAnswers
                .AsNoTracking()
                .FirstOrDefaultAsync(qa => qa.Id == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting questionnaire answers by ID {Id}", id);
            throw;
        }
    }

    public async Task<QuestionAnswers> UpdateAsync(QuestionAnswers questionAnswers)
    {
        try
        {
            questionAnswers.UpdatedAt = DateTime.UtcNow;
            _context.QuestionAnswers.Update(questionAnswers);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Updated questionnaire answers {Id} for registration {RegistrationId}", 
                questionAnswers.Id, questionAnswers.PremaritalRegistrationId);
            
            return questionAnswers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating questionnaire answers {Id}", questionAnswers.Id);
            throw;
        }
    }

    public async Task DeleteAsync(string id)
    {
        try
        {
            var questionAnswers = await _context.QuestionAnswers.FindAsync(id);
            if (questionAnswers != null)
            {
                _context.QuestionAnswers.Remove(questionAnswers);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Deleted questionnaire answers {Id}", id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting questionnaire answers {Id}", id);
            throw;
        }
    }

    public async Task<IEnumerable<QuestionAnswers>> GetAllAsync(int skip = 0, int take = 100)
    {
        try
        {
            return await _context.QuestionAnswers
                .AsNoTracking()
                .OrderByDescending(qa => qa.SubmittedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
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
            return await _context.QuestionAnswers
                .AnyAsync(qa => qa.PremaritalRegistrationId == premaritalRegistrationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking existence of questionnaire answers for registration {RegistrationId}", 
                premaritalRegistrationId);
            throw;
        }
    }
}