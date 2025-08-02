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

    public ConfirmationRegisterController(IConfirmationRegisterService confirmationService)
    {
        _confirmationService = confirmationService;
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] ConfirmationRegisterDto dto)
    {

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
}
