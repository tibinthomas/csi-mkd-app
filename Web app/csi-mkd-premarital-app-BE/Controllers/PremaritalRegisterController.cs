using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;

namespace csi_mkd_premarital_app_BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PremaritalRegisterController : ControllerBase
{
    private readonly IPremaritalRegisterService _service;
    private readonly IRecaptchaService _recaptcha;

    public PremaritalRegisterController(IPremaritalRegisterService service, IRecaptchaService recaptcha)
    {
        _service = service;
        _recaptcha = recaptcha;
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
        return StatusCode(result.StatusCode, result.Data);
    }

    [HttpPost("save-file-urls")]
    public async Task<IActionResult> SaveFiles([FromForm] PremaritalDocumentDto dto)
    {
        var result = await _service.SaveFiles(dto);
        return StatusCode(result.StatusCode, result.Data);
    }

    [HttpPut("{id}/paymentstatus")]
    public async Task<IActionResult> UpdatePaymentStatus([FromRoute] int id, [FromBody] PaymentStatusUpdateDto dto)
        => StatusCode((await _service.UpdatePaymentStatus(id, dto)).StatusCode);

    [HttpGet("check-email")]
    public async Task<IActionResult> CheckEmail(string email)
        => Ok(await _service.CheckEmailExists(email));

    [HttpGet("filter")]
    public async Task<IActionResult> FilteredRegistrations([FromQuery] RegistrationFilterDto filter)
        => Ok(await _service.GetFilteredRegistrations(filter));

    [HttpGet("total")]
    public async Task<IActionResult> GetTotalRegistrations()
    {
        var total = await _service.GetTotalRegistrations();
        return Ok(new { total });
    }
}


