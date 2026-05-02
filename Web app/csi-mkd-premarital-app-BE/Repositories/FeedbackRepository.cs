using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories
{

    public class FeedbackRepository(CosmosDbContext db) : IFeedbackRepository
    {
        public async Task<ClassFeedback?> GetByPremaritalRegistrationIdAsync(Guid premaritalRegistrationId)
        {
            return await db.ClassFeedbacks
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.PremaritalRegistrationId == premaritalRegistrationId);
        }

        public async Task<ClassFeedback> CreateOrUpdateAsync(ClassFeedback feedback)
        {
            var existingFeedback = await db.ClassFeedbacks
                .FirstOrDefaultAsync(f => f.PremaritalRegistrationId == feedback.PremaritalRegistrationId);

            if (existingFeedback != null)
            {
                // Update existing feedback
                existingFeedback.Email = feedback.Email;
                existingFeedback.Name = feedback.Name;
                existingFeedback.Feedbacks = feedback.Feedbacks;
                existingFeedback.UpdatedAt = DateTime.UtcNow;
                
                db.ClassFeedbacks.Update(existingFeedback);
            }
            else
            {
                // Create new feedback
                db.ClassFeedbacks.Add(feedback);
                existingFeedback = feedback;
            }

            await db.SaveChangesAsync();
            return existingFeedback;
        }

        public async Task<List<ClassFeedback>> GetAllAsync()
        {
            return await db.ClassFeedbacks
                .AsNoTracking()
                .OrderByDescending(f => f.UpdatedAt)
                .ToListAsync();
        }

        public async Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId)
        {
            var feedback = await GetByPremaritalRegistrationIdAsync(registrationId);
            if (feedback == null)
                return new List<int>();

            return feedback.Feedbacks.Keys.Select(int.Parse).ToList();
        }

        public async Task<ClassFeedbackDetail?> GetFeedbackForClassAsync(Guid premaritalRegistrationId, int classId)
        {
            var feedback = await GetByPremaritalRegistrationIdAsync(premaritalRegistrationId);
            return feedback?.GetFeedbackForClass(classId);
        }

        public async Task UpdateFeedbackForClassAsync(Guid premaritalRegistrationId, int classId, ClassFeedbackDetail feedbackDetail)
        {
            var feedback = await db.ClassFeedbacks
                .FirstOrDefaultAsync(f => f.PremaritalRegistrationId == premaritalRegistrationId);

            if (feedback == null)
            {
                // Create new feedback record for this user
                feedback = new ClassFeedback
                {
                    PremaritalRegistrationId = premaritalRegistrationId,
                    Email = string.Empty, // Will be updated by service layer
                    Name = string.Empty   // Will be updated by service layer
                };
                db.ClassFeedbacks.Add(feedback);
            }

            feedback.SetFeedbackForClass(classId, feedbackDetail);
            feedback.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
        }

        public async Task<bool> DeleteFeedbackForClassAsync(Guid premaritalRegistrationId, int classId)
        {
            var feedback = await db.ClassFeedbacks
                .FirstOrDefaultAsync(f => f.PremaritalRegistrationId == premaritalRegistrationId);

            if (feedback == null)
                return false;

            var removed = feedback.RemoveFeedbackForClass(classId);
            if (removed)
            {
                feedback.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();
            }

            return removed;
        }

    }
}
