using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;

namespace csi_mkd_premarital_app_BE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PremaritalRegisterController : ControllerBase
{
    private readonly IPremaritalRegisterService _service;

    public PremaritalRegisterController(IPremaritalRegisterService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromForm] PremaritalRegistrationDto dto)
    {
        var result = await _service.Register(dto);
        return StatusCode(result.StatusCode, result.Data);
    }

    // [HttpGet]
    // public async Task<IActionResult> GetAllRegistrations([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    //     => Ok(await _service.GetAllRegistrations(page, pageSize));

    [HttpPut("{id}/paymentstatus")]
    public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] PaymentStatusUpdateDto dto)
        => StatusCode((await _service.UpdatePaymentStatus(id, dto)).StatusCode);

    [HttpGet("check-email")]
    public async Task<IActionResult> CheckEmail(string email)
        => Ok(await _service.CheckEmailExists(email));

    [HttpGet("filter")]
    public async Task<IActionResult> FilteredRegistrations([FromQuery] RegistrationFilterDto filter)
        => Ok(await _service.GetFilteredRegistrations(filter));
}


