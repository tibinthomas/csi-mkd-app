using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using System.Security.Cryptography;
using System.Text;

namespace csi_mkd_premarital_app_BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PremaritalRegisterController : ControllerBase
{
    private readonly IPremaritalRegisterService _service;
    private readonly IRecaptchaService _recaptcha;
    private readonly IOutputCacheStore _cache;

    public PremaritalRegisterController(IPremaritalRegisterService service, IRecaptchaService recaptcha, IOutputCacheStore cache)
    {
        _service = service;
        _recaptcha = recaptcha;
        _cache = cache;
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromForm] PremaritalRegisterDto dto)
    {

        // Verify reCAPTCHA token
        if (!await _recaptcha.VerifyTokenAsync(dto.RecaptchaToken))
        {
            return BadRequest(new { Message = "Invalid reCAPTCHA token." });
        }
        var result = await _service.Register(dto);
        await _cache.EvictByTagAsync("premarital-regs", default);
        return StatusCode(result.StatusCode, result.Data);
    }

    [HttpPost("save-file-urls")]
    public async Task<IActionResult> SaveFiles([FromForm] PremaritalDocumentDto dto)
    {
        var result = await _service.SaveFiles(dto);
        await _cache.EvictByTagAsync("premarital-regs", default);
        return StatusCode(result.StatusCode, result.Data);
    }

    [HttpPut("{id}/paymentstatus")]
    public async Task<IActionResult> UpdatePaymentStatus([FromRoute] int id, [FromBody] PaymentStatusUpdateDto dto)
    {
        var result = await _service.UpdatePaymentStatus(id, dto);
        await _cache.EvictByTagAsync("premarital-regs", default);
        return StatusCode(result.StatusCode);
    }

    [HttpGet("check-email")]
    [OutputCache(PolicyName = "Expire10s", Tags = ["premarital-regs"])]
    public async Task<IActionResult> CheckEmail(string email)
        => Ok(await _service.CheckEmailExists(email));

    [HttpGet("filter")]
    [OutputCache(PolicyName = "Expire10s", Tags = ["premarital-regs"])]
    public async Task<IActionResult> FilteredRegistrations([FromQuery] RegistrationFilterDto filter)
    {
        var data = await _service.GetFilteredRegistrations(filter);
        var version = $"{filter.Page}:{filter.PageSize}:{filter.Search}:{filter.UnapprovedOnly}:{filter.ActiveSessionOnly}:{filter.SessionYear}:{filter.SessionName}";
        var etag = GenerateETag(version);
        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);
        Response.Headers.ETag = etag;
        return Ok(data);
    }

    [HttpGet("total")]
    [OutputCache(PolicyName = "Expire10s", Tags = ["premarital-regs"])]
    public async Task<IActionResult> GetTotalRegistrations()
    {
        var total = await _service.GetTotalRegistrations();
        var version = $"{total}";
        var etag = GenerateETag(version);
        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);
        Response.Headers.ETag = etag;
        return Ok(new { total });
    }

    private static string GenerateETag(string input)
    {
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = SHA256.HashData(bytes);
        var base64 = Convert.ToBase64String(hash);
        return $"\"{base64}\"";
    }
}


