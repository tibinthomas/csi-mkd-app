using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories
{

    public class FeedbackRepository(ApplicationDbContext db) : IFeedbackRepository
    {
        public async Task AddAsync(ClassFeedback feedback)
        {
            db.ClassFeedbacks.Add(feedback);
            await db.SaveChangesAsync();
        }

        public async Task<List<ClassFeedback>> GetAllAsync()
        {
            return await db.ClassFeedbacks
                .AsNoTracking()
                .OrderByDescending(f => f.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<int>> GetCompletedClassIdsAsync(Guid registrationId)
        {
            return await db.ClassFeedbacks
                .AsNoTracking()
                .Where(f => f.PremaritalRegistrationId == registrationId)
                .Select(f => f.ClassId)
                .ToListAsync();
        }

    }
}
