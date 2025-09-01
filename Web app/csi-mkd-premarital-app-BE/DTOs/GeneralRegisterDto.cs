using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class GeneralRegisterDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string FatherName { get; set; }
        public required string Address { get; set; }
        public required string Sex { get; set; }
        public int Age { get; set; }
        public required string Education { get; set; }
        public required string Occupation { get; set; }
        [Range(1, 300)]
        public int? ChurchId { get; set; }
        public string? PriestName { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public required string MaritalStatus { get; set; }
        public required string SessionType { get; set; }
        public bool PaymentStatus { get; set; }
        public bool Declaration { get; set; }
        public required string RecaptchaToken { get; set; } // Added for reCAPTCHA verification
    }
}