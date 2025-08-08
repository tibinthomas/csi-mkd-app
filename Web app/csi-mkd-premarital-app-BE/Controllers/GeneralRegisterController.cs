using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Services;

namespace csi_mkd_premarital_app_BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeneralRegisterController : ControllerBase
{
    private IGeneralRegisterService _service;

    private IRecaptchaService _recaptchaService;
    public GeneralRegisterController(IGeneralRegisterService service, IRecaptchaService recaptchaService)
    {
        _service = service;
        _recaptchaService = recaptchaService;
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

        return StatusCode(result.StatusCode, result.Data);

    }

    [HttpPost("save-photo-url")]
    public async Task<IActionResult> SaveFiles([FromForm] GeneralDocumentDto dto)
    {
        var result = await _service.SaveFiles(dto);
        return StatusCode(result.StatusCode, result.Data);

    }

    [HttpGet("check-email")]
    public async Task<IActionResult> CheckEmail(string email)
     => Ok(await _service.CheckEmailExists(email));

    [HttpPut("{id}/paymentstatus")]
    public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] PaymentStatusUpdateDto dto)
         => StatusCode((await _service.UpdatePaymentStatus(id, dto)).StatusCode);


    [HttpGet("filter")]
    public async Task<IActionResult> FilteredRegistrations([FromQuery] GeneralRegisterFilterDto filter)
      => Ok(await _service.GetFilteredRegistrations(filter));

    [HttpGet("total")]
    public async Task<IActionResult> GetTotalRegistrations()
    {
        var total = await _service.GetTotalRegistrations();
        return Ok(new { total });
    }
}
