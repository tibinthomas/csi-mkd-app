using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories
{
    public class CosmosDbFeedbackRepository : ICosmosDbFeedbackRepository
    {
        private readonly CosmosDbContext _context;

        public CosmosDbFeedbackRepository(CosmosDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(FeedbackDocument feedback)
        {
            // Ensure partition key is set
            feedback.SetPartitionKey();
            
            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
        }

        public async Task<List<FeedbackDocument>> GetAllAsync()
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .OrderByDescending(f => f.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<FeedbackDocument>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Where(f => f.Date >= startDate && f.Date <= endDate)
                .OrderByDescending(f => f.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<FeedbackDocument>> GetByRegistrationIdAsync(int registrationId)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Where(f => f.Metadata.PremaritalRegistrationId == registrationId)
                .OrderByDescending(f => f.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<int>> GetCompletedClassIdsAsync(int registrationId)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Where(f => f.Metadata.PremaritalRegistrationId == registrationId)
                .Select(f => f.ClassId)
                .Distinct()
                .ToListAsync();
        }

        public async Task<FeedbackDocument?> GetByIdAsync(string id, string partitionKey)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Where(f => f.id == id && f.PartitionKey == partitionKey)
                .FirstOrDefaultAsync();
        }

        public async Task<List<FeedbackDocument>> GetByClassIdAsync(int classId)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Where(f => f.ClassId == classId)
                .OrderByDescending(f => f.SubmittedAt)
                .ToListAsync();
        }

        public async Task<Dictionary<int, double>> GetAverageRatingsByClassAsync()
        {
            // Cosmos DB doesn't support complex GroupBy operations, so we'll fetch all data and group in memory
            var allFeedback = await _context.Feedbacks
                .AsNoTracking()
                .ToListAsync();

            var result = allFeedback
                .GroupBy(f => f.ClassId)
                .ToDictionary(g => g.Key, g => g.Average(f => f.Ratings.Average));

            return result;
        }

        public async Task<long> GetFeedbackCountAsync()
        {
            return await _context.Feedbacks.LongCountAsync();
        }

        public async Task<List<FeedbackDocument>> GetRecentFeedbackAsync(int count = 10)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .OrderByDescending(f => f.SubmittedAt)
                .Take(count)
                .ToListAsync();
        }
    }
}