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

        public async Task AddAsync(ClassFeedback feedback)
        {
            try
            {
                // Try to add new feedback first
                _context.ClassFeedbacks.Add(feedback);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is Microsoft.Azure.Cosmos.CosmosException cosmosEx && cosmosEx.StatusCode == System.Net.HttpStatusCode.Conflict)
            {
                // Document already exists, clear the context and update existing
                _context.ChangeTracker.Clear();
                
                // Find existing document by ID pattern
                var documentId = $"{feedback.PremaritalRegistrationId}_{feedback.Email}".ToLowerInvariant();
                var existingFeedback = await _context.ClassFeedbacks
                    .FirstOrDefaultAsync(f => EF.Property<string>(f, "id") == documentId);
                
                if (existingFeedback != null)
                {
                    // Merge the feedback - append new class feedback to existing document
                    foreach (var newEntry in feedback.FeedbackEntries)
                    {
                        // Remove existing entry with same ClassId if any
                        var existingEntry = existingFeedback.FeedbackEntries
                            .FirstOrDefault(e => e.ClassId == newEntry.ClassId);
                        if (existingEntry != null)
                        {
                            existingFeedback.FeedbackEntries.Remove(existingEntry);
                        }
                        
                        // Add the new entry
                        existingFeedback.FeedbackEntries.Add(newEntry);
                    }
                    
                    existingFeedback.UpdatedAt = DateTime.UtcNow;
                    
                    _context.ClassFeedbacks.Update(existingFeedback);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // This should not happen, but let's handle it gracefully
                    throw new InvalidOperationException("Document conflict detected but document not found for update");
                }
            }
        }

        public async Task<List<ClassFeedback>> GetAllAsync()
        {
            return await _context.ClassFeedbacks
                .AsNoTracking()
                .OrderByDescending(f => f.UpdatedAt)
                .ToListAsync();
        }

        public async Task<List<ClassFeedback>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.ClassFeedbacks
                .AsNoTracking()
                .Where(f => f.UpdatedAt >= startDate && f.UpdatedAt <= endDate)
                .OrderByDescending(f => f.UpdatedAt)
                .ToListAsync();
        }

        public async Task<List<ClassFeedback>> GetByRegistrationIdAsync(Guid registrationId)
        {
            return await _context.ClassFeedbacks
                .AsNoTracking()
                .Where(f => f.PremaritalRegistrationId == registrationId)
                .OrderByDescending(f => f.UpdatedAt)
                .ToListAsync();
        }

        public async Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId)
        {
            var feedback = await _context.ClassFeedbacks
                .AsNoTracking()
                .Where(f => f.PremaritalRegistrationId == registrationId)
                .FirstOrDefaultAsync();

            if (feedback == null)
                return new List<int>();

            // Extract class IDs from the FeedbackEntries collection
            return feedback.FeedbackEntries.Select(e => int.Parse(e.ClassId)).ToList();
        }

        public async Task<ClassFeedback?> GetByIdAsync(string id, string partitionKey)
        {
            // Convert string id to int for ClassFeedback
            if (!int.TryParse(id, out int intId))
                return null;

            return await _context.ClassFeedbacks
                .AsNoTracking()
                .Where(f => f.Id == intId)
                .FirstOrDefaultAsync();
        }

        public async Task<List<ClassFeedback>> GetByClassIdAsync(int classId)
        {
            // For ClassFeedback, we need to query where the FeedbackEntries contains the class ID
            // This would require a more complex query or server-side filtering
            var allFeedbacks = await _context.ClassFeedbacks
                .AsNoTracking()
                .ToListAsync();

            // Filter in memory for class ID (not ideal for large datasets)
            return allFeedbacks
                .Where(f => f.FeedbackEntries.Any(e => e.ClassId == classId.ToString()))
                .OrderByDescending(f => f.UpdatedAt)
                .ToList();
        }

        public async Task<Dictionary<int, double>> GetAverageRatingsByClassAsync()
        {
            // Fetch all feedback and process in memory
            var allFeedback = await _context.ClassFeedbacks
                .AsNoTracking()
                .ToListAsync();

            var classRatings = new Dictionary<int, List<double>>();
            
            foreach (var feedback in allFeedback)
            {
                foreach (var entry in feedback.FeedbackEntries)
                {
                    var classId = int.Parse(entry.ClassId);
                    var average = entry.Detail.Ratings.Average;
                    
                    if (!classRatings.ContainsKey(classId))
                        classRatings[classId] = new List<double>();
                    
                    classRatings[classId].Add(average);
                }
            }

            return classRatings.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Average());
        }

        public async Task<long> GetFeedbackCountAsync()
        {
            return await _context.ClassFeedbacks.LongCountAsync();
        }

        public async Task<List<ClassFeedback>> GetRecentFeedbackAsync(int count = 10)
        {
            return await _context.ClassFeedbacks
                .AsNoTracking()
                .OrderByDescending(f => f.UpdatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<int> GetFeedbackEntriesCountByRegistrationIdAsync(Guid registrationId)
        {
            var feedbacks = await _context.ClassFeedbacks
                .AsNoTracking()
                .Where(f => f.PremaritalRegistrationId == registrationId)
                .Select(f => f.FeedbackEntries)
                .ToListAsync();

            return feedbacks.Sum(entries => entries.Count);
        }
    }
}