using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace csi_mkd_premarital_app_BE.Models
{
    [Index(nameof(Email))]
    [Index(nameof(SubmittedAt))]
    [Index(nameof(PaymentStatus))]
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

        public GeneralDocument? GeneralDocument { get; set; }

        public bool PaymentStatus { get; set; } // true = Paid, false = Unpaid

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // public byte[] RowVersion { get; set; } = default!;

    }
}