using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
namespace csi_mkd_premarital_app_BE.DTOs
{
    public class UpdatePremaritalRegisterDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string FatherName { get; set; }
        public required string Address { get; set; }
        public required string Sex { get; set; }
        public required int Age { get; set; }
        public required string Education { get; set; }
        public required string Occupation { get; set; }
        [Range(1, 300)]
        public int? ChurchId { get; set; }
        public string? ChurchName { get; set; }
        public string? PriestName { get; set; }
        public string? FianceName { get; set; }
        public DateTime? DateOfMarriage { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public required string Days { get; set; }

        // Church activities can be passed as JSON string or individual fields
        public bool? ChoirMember { get; set; }
        public bool? SsTeacher { get; set; }
        public bool? YouthFellowship { get; set; }
        public string? Other { get; set; }
        public required bool Declaration { get; set; }
        public required int SessionId { get; set; }
        public bool PaymentStatus { get; set; }
        // No RecaptchaToken required for updates
    }

    public class PremaritalRegisterDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string FatherName { get; set; }
        public required string Address { get; set; }
        public required string Sex { get; set; }
        public required int Age { get; set; }
        public required string Education { get; set; }
        public required string Occupation { get; set; }
        public int? ChurchId { get; set; }
        public string? ChurchName { get; set; }
        public string? PriestName { get; set; }
        public string? FianceName { get; set; }
        public DateTime? DateOfMarriage { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public required string Days { get; set; }

        // Church activities can be passed as JSON string or individual fields
        public bool? ChoirMember { get; set; }
        public bool? SsTeacher { get; set; }
        public bool? YouthFellowship { get; set; }
        public string? Other { get; set; }
        public required bool Declaration { get; set; }
        public required int SessionId { get; set; }
        public bool PaymentStatus { get; set; }
        public required string RecaptchaToken { get; set; } // Added for reCAPTCHA verification

    }
}