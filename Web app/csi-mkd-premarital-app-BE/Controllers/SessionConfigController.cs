using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.Services;
using csi_mkd_premarital_app_BE.DTOs;

namespace csi_mkd_premarital_app_BE.Controllers;

[ApiController]
[Route("api/sessionconfig")]
public class SessionConfigController : ControllerBase
{
    private readonly ISessionConfigService _service;

    public SessionConfigController(ISessionConfigService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetSessions()
        => Ok(await _service.GetAllSessions());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSession(int id)
    {
        var session = await _service.GetSessionById(id);
        return session == null ? NotFound() : Ok(session);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession(CreateUpdateSessionDto dto)
    {
        var created = await _service.CreateSession(dto);
        return CreatedAtAction(nameof(GetSession), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSession(int id, CreateUpdateSessionDto dto)
    {
        if (id != dto.Id)
            return BadRequest(new { message = "ID in URL does not match ID in request body." });

        var result = await _service.UpdateSession(id, dto);
        return result
            ? NoContent()
            : Conflict(new { message = "The record was modified by another user. Please reload and try again." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        var result = await _service.DeleteSession(id);
        return result
            ? Ok(new { message = "Session deleted successfully." })
            : BadRequest(new { message = "Cannot delete session. It is associated with one or more registrations." });
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessionsByYear(int year)
        => Ok(await _service.GetSessionsByYear(year));
}
