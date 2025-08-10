using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;

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
      => Ok(await _service.GetFilteredRegistrations(filter));

    [HttpGet("total")]
    [OutputCache(PolicyName = "Expire10s", Tags = ["general-regs"])]
    public async Task<IActionResult> GetTotalRegistrations()
    {
        var total = await _service.GetTotalRegistrations();
        return Ok(new { total });
    }
}
