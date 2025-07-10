using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.DTOs;
using System.Text;

namespace csi_mkd_premarital_app_BE.Controllers
{
    [ApiController]
    [Route("api/sessionconfig")]
    public class SessionConfigController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SessionConfigController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper method to map from entity to DTO
        private static SessionConfigurationDto ToDto(SessionConfiguration s) => new()
        {
            Id = s.Id,
            SessionName = s.SessionName,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            IsActive = s.IsActive,
            SubmittedDate = s.SubmittedDate,
            // RowVersion = Convert.ToBase64String(s.RowVersion) // Convert for JSON
        };

        // GET: api/sessions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SessionConfigurationDto>>> GetSessions()
        {
            var sessions = await _context.SessionConfigurations.ToListAsync();
            return sessions.Select(ToDto).ToList();
        }

        // GET: api/sessions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SessionConfigurationDto>> GetSession(int id)
        {
            var session = await _context.SessionConfigurations.FindAsync(id);
            if (session == null) return NotFound();
            return ToDto(session);
        }

        // POST: api/sessions
        [HttpPost]
        public async Task<ActionResult<SessionConfigurationDto>> CreateSession(CreateUpdateSessionDto dto)
        {
            var session = new SessionConfiguration
            {
                SessionName = dto.SessionName,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive,
                SubmittedDate = DateTime.UtcNow,
            };

            _context.SessionConfigurations.Add(session);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSession), new { id = session.Id }, ToDto(session));
        }


        // PUT: api/sessions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSession(int id, CreateUpdateSessionDto dto)
        {
            if (id != dto.Id)
                return BadRequest();

            var existing = await _context.SessionConfigurations.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
            if (existing == null)
                return NotFound();

            // if (string.IsNullOrEmpty(dto.RowVersion))
            //     return BadRequest("RowVersion is required for update.");

            var updated = new SessionConfiguration
            {
                Id = id,
                SessionName = dto.SessionName,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = dto.IsActive,
                SubmittedDate = DateTime.UtcNow,
                // RowVersion = Convert.FromBase64String(dto.RowVersion) // real concurrency check
            };

            // _context.Entry(updated).Property("RowVersion").OriginalValue = updated.RowVersion;
            _context.Entry(updated).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Conflict("The record was modified by another user. Please reload.");
            }

            return NoContent();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSession(int id)
        {
            var session = await _context.SessionConfigurations.FindAsync(id);
            if (session == null)
                return NotFound(new { message = "Session not found." });

            // Check if any PremaritalRegistrations are using this session
            var hasRegistrations = await _context.PremaritalRegistrations
                .AnyAsync(r => r.SessionId == id);

            if (hasRegistrations)
            {
                return BadRequest(new { message = "Cannot delete session. It is associated with one or more registrations." });
            }

            _context.SessionConfigurations.Remove(session);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Session deleted successfully." });
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetSessionsByYear(int year)
        {
            var sessions = await _context.SessionConfigurations
                .Where(s => s.StartDate.Year == year)
                .OrderBy(s => s.StartDate)
                .ToListAsync();

            return Ok(sessions);
        }

    }
}
