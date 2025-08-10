using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using System.Security.Cryptography;
using System.Text;

namespace csi_mkd_premarital_app_BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeneralRegisterController : ControllerBase
{
    private IGeneralRegisterService _service;

    private IRecaptchaService _recaptchaService;
    private readonly IOutputCacheStore _cache;
    public GeneralRegisterController(IGeneralRegisterService service, IRecaptchaService recaptchaService, IOutputCacheStore cache)
    {
        _service = service;
        _recaptchaService = recaptchaService;
        _cache = cache;
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromForm] GeneralRegisterDto dto)
    {
        // Verify reCAPTCHA token
        if (!await _recaptchaService.VerifyTokenAsync(dto.RecaptchaToken))
        {
            return BadRequest(new { Message = "Invalid reCAPTCHA token." });
        }
        var result = await _service.Register(dto);
        await _cache.EvictByTagAsync("general-regs", default);
        return StatusCode(result.StatusCode, result.Data);

    }

    [HttpPost("save-photo-url")]
    public async Task<IActionResult> SaveFiles([FromForm] GeneralDocumentDto dto)
    {
        var result = await _service.SaveFiles(dto);
        await _cache.EvictByTagAsync("general-regs", default);
        return StatusCode(result.StatusCode, result.Data);

    }

    [HttpGet("check-email")]
    [OutputCache(PolicyName = "Expire10s", Tags = ["general-regs"])]
    public async Task<IActionResult> CheckEmail(string email)
     => Ok(await _service.CheckEmailExists(email));

    [HttpPut("{id}/paymentstatus")]
    public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] PaymentStatusUpdateDto dto)
    {
        var result = await _service.UpdatePaymentStatus(id, dto);
        await _cache.EvictByTagAsync("general-regs", default);
        return StatusCode(result.StatusCode);
    }


    [HttpGet("filter")]
    [OutputCache(PolicyName = "Expire10s", Tags = ["general-regs"])]
    public async Task<IActionResult> FilteredRegistrations([FromQuery] GeneralRegisterFilterDto filter)
    {
        var data = await _service.GetFilteredRegistrations(filter);
        var version = $"{filter.Page}:{filter.PageSize}:{filter.Search}:{filter.UnapprovedOnly}";
        var etag = GenerateETag(version);
        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);
        Response.Headers.ETag = etag;
        return Ok(data);
    }

    [HttpGet("total")]
    [OutputCache(PolicyName = "Expire10s", Tags = ["general-regs"])]
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
