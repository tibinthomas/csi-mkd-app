using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.Models
{
    public class PremaritalRegistration
    {
        [Key]
        public int Id { get; set; }

        [Required, StringLength(100)]
        public required string FirstName { get; set; }

        [Required, StringLength(100)]
        public required string LastName { get; set; }

        [Required, StringLength(100)]
        public required string FatherName { get; set; }

        [Required, StringLength(250)]
        public required string Address { get; set; }

        [Required, StringLength(10)]
        public required string Sex { get; set; }

        [Required, Range(18, 120)]
        public required int Age { get; set; }

        [Required, StringLength(100)]
        public required string Education { get; set; }

        [Required, StringLength(100)]
        public required string Occupation { get; set; }

        [Required, StringLength(150)]
        public required string ChurchName { get; set; }

        [StringLength(150)]
        public string? FianceName { get; set; }

        public DateTime? DateOfMarriage { get; set; }

        [Required, Phone]
        public required string Phone { get; set; }

        [Required, EmailAddress]
        public required string Email { get; set; }

        [Required, StringLength(100)]
        public required string Days { get; set; }

        [Required]
        public required string? ChurchActivitiesJson { get; set; } // JSON string of activities

        [Required]
        public required bool Declaration { get; set; }

        [ForeignKey("SessionConfiguration")]
        [Required]
        public required int SessionId { get; set; }

        public SessionConfiguration? SessionConfiguration { get; set; }

        public bool PaymentStatus { get; set; } // true = Paid, false = Unpaid

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public PremaritalDocument? PremaritalDocument { get; set; }

        // [Timestamp]
        // public byte[] RowVersion { get; set; } = default!;
    }
}
