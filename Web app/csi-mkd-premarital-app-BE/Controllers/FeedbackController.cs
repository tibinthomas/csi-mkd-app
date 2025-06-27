// Controllers/FeedbackController.cs
using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;
using csi_mkd_premarital_app_BE.DTOs;


namespace csi_mkd_premarital_app_BE.Controllers
{
    [ApiController]
    [Route("api/feedback")]
    public class FeedbackController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FeedbackController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitFeedback([FromBody] SessionFeedbackDto dto)
        {
            var feedback = new SessionFeedback
            {
                SessionTitle = dto.SessionTitle,
                Name = dto.Name,
                Email = dto.Email,
                Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
                QualityRating = dto.QualityRating,
                RelevanceRating = dto.RelevanceRating,
                EngagementRating = dto.EngagementRating,
                OrganizationRating = dto.OrganizationRating,
                Valuable = dto.Valuable,
                Improvements = dto.Improvements,
                Comments = dto.Comments
            };

            _context.SessionFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback submitted successfully." });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            var allFeedbacks = await _context.SessionFeedbacks
                .OrderByDescending(f => f.SubmittedAt)
                .ToListAsync();

            return Ok(allFeedbacks);
        }
    }
}
