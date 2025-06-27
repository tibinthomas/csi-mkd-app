using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

public class PremaritalRegistrationDto
{
    public required string Name { get; set; }
    public required string FatherName { get; set; }
    public required string Address { get; set; }
    public required string Sex { get; set; }
    public required int Age { get; set; }
    public required string Education { get; set; }
    public required string Occupation { get; set; }
    public required string ChurchName { get; set; }
    public string? FianceName { get; set; }
    public DateTime DateOfMarriage { get; set; }
    public required string Phone { get; set; }
    public required string Email { get; set; }
    public required string Days { get; set; }

    // Church activities can be passed as JSON string or individual fields
    public bool? ChoirMember { get; set; }
    public bool? SsTeacher { get; set; }
    public bool? YouthFellowship { get; set; }
    public string? Other { get; set; }

    public required bool Declaration { get; set; }

    public required IFormFile Photo { get; set; }

    public required IFormFile VicarLetter { get; set; }
}
