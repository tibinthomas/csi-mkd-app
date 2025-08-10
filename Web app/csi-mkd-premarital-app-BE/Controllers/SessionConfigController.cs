using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.Services;
using csi_mkd_premarital_app_BE.DTOs;
using Microsoft.AspNetCore.OutputCaching;
using System.Security.Cryptography;
using System.Text;

namespace csi_mkd_premarital_app_BE.Controllers;

[ApiController]
[Route("api/sessionconfig")]
public class SessionConfigController : ControllerBase
{
    private readonly ISessionConfigService _service;
    private readonly IOutputCacheStore _cache;

    public SessionConfigController(ISessionConfigService service, IOutputCacheStore cache)
    {
        _service = service;
        _cache = cache;
    }

    [HttpGet]
    [OutputCache(PolicyName = "Expire2m", Tags = ["sessions"])]
    public async Task<IActionResult> GetSessions()
    {
        var sessions = await _service.GetAllSessions();
        var latest = sessions.Count == 0 ? DateTime.MinValue : sessions.Max(s => s.SubmittedDate);
        var version = $"{sessions.Count}:{latest.ToUniversalTime():O}";
        var etag = GenerateETag(version);
        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);
        Response.Headers.ETag = etag;
        return Ok(sessions);
    }

    [HttpGet("{id}")]
    [OutputCache(PolicyName = "Expire2m", Tags = ["sessions"])]
    public async Task<IActionResult> GetSession(int id)
    {
        var session = await _service.GetSessionById(id);
        if (session == null) return NotFound();
        var version = $"{session.Id}:{session.SubmittedDate.ToUniversalTime():O}:{session.IsActive}:{session.SessionName}";
        var etag = GenerateETag(version);
        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);
        Response.Headers.ETag = etag;
        return Ok(session);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession(CreateUpdateSessionDto dto)
    {
        var created = await _service.CreateSession(dto);
        await _cache.EvictByTagAsync("sessions", default);
        return CreatedAtAction(nameof(GetSession), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSession(int id, CreateUpdateSessionDto dto)
    {
        if (id != dto.Id)
            return BadRequest(new { message = "ID in URL does not match ID in request body." });

        var result = await _service.UpdateSession(id, dto);
        await _cache.EvictByTagAsync("sessions", default);
        return result
            ? NoContent()
            : Conflict(new { message = "The record was modified by another user. Please reload and try again." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        var result = await _service.DeleteSession(id);
        await _cache.EvictByTagAsync("sessions", default);
        return result
            ? Ok(new { message = "Session deleted successfully." })
            : BadRequest(new { message = "Cannot delete session. It is associated with one or more registrations." });
    }

    [HttpGet("sessions")]
    [OutputCache(PolicyName = "Expire2m", Tags = ["sessions"])]
    public async Task<IActionResult> GetSessionsByYear(int year)
    {
        var sessions = await _service.GetSessionsByYear(year);
        var latest = sessions.Count == 0 ? DateTime.MinValue : sessions.Max(s => s.SubmittedDate);
        var version = $"{year}:{sessions.Count}:{latest.ToUniversalTime():O}";
        var etag = GenerateETag(version);
        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);
        Response.Headers.ETag = etag;
        return Ok(sessions);
    }

    private static string GenerateETag(string input)
    {
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = SHA256.HashData(bytes);
        var base64 = Convert.ToBase64String(hash);
        return $"\"{base64}\""; // quoted strong ETag
    }
}
