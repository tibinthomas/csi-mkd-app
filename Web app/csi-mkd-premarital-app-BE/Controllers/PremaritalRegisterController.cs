using csi_mkd_premarital_app_BE.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class PremaritalRegisterController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public PremaritalRegisterController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromForm] PremaritalRegistrationDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Save files to wwwroot/uploads or any folder you prefer
        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        // Save Photo
        var photoFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Photo.FileName)}";
        var photoPath = Path.Combine(uploadsFolder, photoFileName);
        using (var photoStream = new FileStream(photoPath, FileMode.Create))
        {
            await dto.Photo.CopyToAsync(photoStream);
        }

        // Save Vicar Letter
        var vicarLetterFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.VicarLetter.FileName)}";
        var vicarLetterPath = Path.Combine(uploadsFolder, vicarLetterFileName);
        using (var vicarStream = new FileStream(vicarLetterPath, FileMode.Create))
        {
            await dto.VicarLetter.CopyToAsync(vicarStream);
        }
        // Compose Church Activities JSON
        var churchActivities = new
        {
            choirMember = dto.ChoirMember,
            ssTeacher = dto.SsTeacher,
            youthFellowship = dto.YouthFellowship,
            other = dto.Other
        };

        var churchActivitiesJson = JsonSerializer.Serialize(churchActivities);

        // Map DTO to entity
        var registration = new PremaritalRegistration
        {
            Name = dto.Name,
            FatherName = dto.FatherName,
            Address = dto.Address,
            Sex = dto.Sex,
            Age = dto.Age,
            Education = dto.Education,
            Occupation = dto.Occupation,
            ChurchName = dto.ChurchName,
            FianceName = dto.FianceName,
            DateOfMarriage = dto.DateOfMarriage.ToUniversalTime(),
            Phone = dto.Phone,
            Email = dto.Email,
            Days = dto.Days,
            ChurchActivitiesJson = churchActivitiesJson,
            Declaration = dto.Declaration,
            PhotoFilePath = $"/uploads/{photoFileName}",
            VicarLetterFilePath = $"/uploads/{vicarLetterFileName}",
        };

        _context.PremaritalRegistrations.Add(registration);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Registration saved successfully" });
    }

    // [HttpGet]
    // public async Task<IActionResult> GetAllRegistrations()
    // {
    //     var registrations = await _context.PremaritalRegistrations
    //         .Select(r => new
    //         {
    //             r.Id,
    //             r.Name,
    //             r.FatherName,
    //             r.Address,
    //             r.Sex,
    //             r.Age,
    //             r.Education,
    //             r.Occupation,
    //             r.ChurchName,
    //             r.FianceName,
    //             r.DateOfMarriage,
    //             r.Phone,
    //             r.Email,
    //             r.Days,
    //             r.ChurchActivitiesJson,
    //             r.Declaration,
    //             PhotoPath = r.PhotoFilePath,
    //             VicarLetterPath = r.VicarLetterFilePath,
    //             RowVersion = Convert.ToBase64String(r.RowVersion)
    //         })
    //         .ToListAsync();

    //     // Parse ChurchActivitiesJson and map to DTO
    //     var result = registrations.Select(r =>
    //     {
    //         bool choirMember = false;
    //         bool ssTeacher = false;
    //         bool youthFellowship = false;
    //         string? other = null;

    //         if (!string.IsNullOrEmpty(r.ChurchActivitiesJson))
    //         {
    //             try
    //             {
    //                 using var doc = JsonDocument.Parse(r.ChurchActivitiesJson);
    //                 var root = doc.RootElement;
    //                 choirMember = root.TryGetProperty("choirMember", out var choirProp) && choirProp.GetBoolean();
    //                 ssTeacher = root.TryGetProperty("ssTeacher", out var ssProp) && ssProp.GetBoolean();
    //                 youthFellowship = root.TryGetProperty("youthFellowship", out var youthProp) && youthProp.GetBoolean();
    //                 other = root.TryGetProperty("other", out var otherProp) ? otherProp.GetString() : null;
    //             }
    //             catch
    //             {
    //                 // optionally log parse errors
    //             }
    //         }

    //         return new PremaritalRegisterResponseDto
    //         {
    //             Id = r.Id,
    //             Name = r.Name,
    //             FatherName = r.FatherName,
    //             Address = r.Address,
    //             Sex = r.Sex,
    //             Age = r.Age,
    //             Education = r.Education,
    //             Occupation = r.Occupation,
    //             ChurchName = r.ChurchName,
    //             FianceName = r.FianceName,
    //             DateOfMarriage = r.DateOfMarriage,
    //             Phone = r.Phone,
    //             Email = r.Email,
    //             Days = r.Days,
    //             ChoirMember = choirMember,
    //             SsTeacher = ssTeacher,
    //             YouthFellowship = youthFellowship,
    //             OtherChurchActivities = other,
    //             PhotoPath = r.PhotoPath,
    //             VicarLetterPath = r.VicarLetterPath,
    //             RowVersion = r.RowVersion
    //         };
    //     });

    //     return Ok(result);
    // }
    [HttpGet]
    public async Task<IActionResult> GetAllRegistrations()
    {

        var registrations = await _context.PremaritalRegistrations
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.FatherName,
                r.Address,
                r.Sex,
                r.Age,
                r.Education,
                r.Occupation,
                r.ChurchName,
                r.FianceName,
                r.DateOfMarriage,
                r.Phone,
                r.Email,
                r.Days,
                r.ChurchActivitiesJson,
                r.Declaration,
                PhotoPath = r.PhotoFilePath,
                VicarLetterPath = r.VicarLetterFilePath,
                RowVersion = Convert.ToBase64String(r.RowVersion)  // byte[] to base64 string
            })
            .ToListAsync();

        return Ok(registrations);
    }


}
