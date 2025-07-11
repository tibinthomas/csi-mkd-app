using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.Models
{
    public class GeneralRegistration
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public required string FirstName { get; set; }
        [Required]

        public required string LastName { get; set; }

        [Required]
        public required string FatherName { get; set; }

        [Required]
        public required string Address { get; set; }

        [Required]
        public required string Sex { get; set; }

        [Required, Range(1, 120)]
        public int Age { get; set; }

        [Required]
        public required string Education { get; set; }

        [Required]
        public required string Occupation { get; set; }

        public string? ChurchName { get; set; }

        [Required, RegularExpression(@"^\d{10}$")]
        public required string Phone { get; set; }

        [Required, EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string MaritalStatus { get; set; }

        [Required]
        public required string SessionType { get; set; }

        public bool Declaration { get; set; }

        public string? PhotoPath { get; set; }
        // public byte[] RowVersion { get; set; } = default!;

    }
}