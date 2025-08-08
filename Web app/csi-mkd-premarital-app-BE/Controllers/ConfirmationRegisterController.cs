using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using csi_mkd_premarital_app_BE.Models;

[ApiController]
[Route("api/[controller]")]
public class ConfirmationRegisterController : Controller
{
    private readonly IConfirmationRegisterService _confirmationService;
    private readonly IRecaptchaService _recaptchaService;

    public ConfirmationRegisterController(IConfirmationRegisterService confirmationService, IRecaptchaService recaptchaService)
    {
        _confirmationService = confirmationService;
        _recaptchaService = recaptchaService;
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

        return StatusCode(result.StatusCode, result.Data);

    }

    [HttpPost("save-file-url")]
    public async Task<IActionResult> SaveFiles([FromForm] ConfirmationDocumentDto dto)
    {
        var result = await _confirmationService.SaveFiles(dto);
        return StatusCode(result.StatusCode, result.Data);

    }

    [HttpGet("filter")]
    public async Task<IActionResult> FilteredRegistrations([FromQuery] ConfirmationRegisterFilterDto filter)
      => Ok(await _confirmationService.GetFilteredRegistrations(filter));

    [HttpGet("total")]
    public async Task<IActionResult> GetTotalRegistrations()
    {
        var total = await _confirmationService.GetTotalRegistrations();
        return Ok(new { total });
    }
}
