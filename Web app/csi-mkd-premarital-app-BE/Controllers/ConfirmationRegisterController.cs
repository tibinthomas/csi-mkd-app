using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.AspNetCore.OutputCaching;
using System.Security.Cryptography;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class ConfirmationRegisterController : Controller
{
    private readonly IConfirmationRegisterService _confirmationService;
    private readonly IRecaptchaService _recaptchaService;
    private readonly IOutputCacheStore _cache;

    public ConfirmationRegisterController(IConfirmationRegisterService confirmationService, IRecaptchaService recaptchaService, IOutputCacheStore cache)
    {
        _confirmationService = confirmationService;
        _recaptchaService = recaptchaService;
        _cache = cache;
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] ConfirmationRegisterDto dto)
    {

        // Verify reCAPTCHA token
        if (!await _recaptchaService.VerifyTokenAsync(dto.RecaptchaToken))
        {
            return BadRequest(new { Message = "Invalid reCAPTCHA token." });
        }
        var result = await _confirmationService.Register(dto);
        await _cache.EvictByTagAsync("confirmation-regs", default);
        return StatusCode(result.StatusCode, result.Data);

    }

    [HttpPost("save-file-url")]
    public async Task<IActionResult> SaveFiles([FromForm] ConfirmationDocumentDto dto)
    {
        var result = await _confirmationService.SaveFiles(dto);
        await _cache.EvictByTagAsync("confirmation-regs", default);
        return StatusCode(result.StatusCode, result.Data);

    }

    [HttpGet("filter")]
    [OutputCache(PolicyName = "Expire10s", Tags = ["confirmation-regs"])]
    public async Task<IActionResult> FilteredRegistrations([FromQuery] ConfirmationRegisterFilterDto filter)
    {
        var data = await _confirmationService.GetFilteredRegistrations(filter);
        var version = $"{filter.Page}:{filter.PageSize}:{filter.Search}";
        var etag = GenerateETag(version);
        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);
        Response.Headers.ETag = etag;
        return Ok(data);
    }

    [HttpGet("total")]
    [OutputCache(PolicyName = "Expire10s", Tags = ["confirmation-regs"])]
    public async Task<IActionResult> GetTotalRegistrations()
    {
        var total = await _confirmationService.GetTotalRegistrations();
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
