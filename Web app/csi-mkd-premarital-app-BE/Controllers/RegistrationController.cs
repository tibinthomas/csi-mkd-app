// Controllers/RegistrationController.cs
using csi_mkd_premarital_app_BE.Data;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/register")]
public class RegistrationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public RegistrationController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var registrations = await _context.Registrations
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync();

        return Ok(registrations);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromForm] RegistrationDto dto)
    {
        // Create upload folder if it doesn't exist
        var uploadPath = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        string photoFileName = null, pastorLetterFileName = null;

        // Save Photo
        if (dto.Photo != null)
        {
            photoFileName = $"{Guid.NewGuid()}_{dto.Photo.FileName}";
            var path = Path.Combine(uploadPath, photoFileName);
            using var stream = new FileStream(path, FileMode.Create);
            await dto.Photo.CopyToAsync(stream);
        }

        // Save Pastor Letter
        if (dto.PastorLetter != null)
        {
            pastorLetterFileName = $"{Guid.NewGuid()}_{dto.PastorLetter.FileName}";
            var path = Path.Combine(uploadPath, pastorLetterFileName);
            using var stream = new FileStream(path, FileMode.Create);
            await dto.PastorLetter.CopyToAsync(stream);
        }

        // Save to DB
        var registration = new Registration
        {
            Name = dto.Name,
            Address = dto.Address,
            Church = dto.Church,
            PartnerName = dto.PartnerName,
            Education = dto.Education,
            PhotoFileName = photoFileName,
            PastorLetterFileName = pastorLetterFileName
        };

        _context.Registrations.Add(registration);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Registration saved successfully!" });
    }
}
