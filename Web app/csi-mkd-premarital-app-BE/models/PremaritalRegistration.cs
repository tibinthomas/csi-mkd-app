using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Models
{
    [Index(nameof(Id))]
    [Index(nameof(Email))]
    [Index(nameof(SubmittedAt))]
    [Index(nameof(SessionId))]
    [Index(nameof(PaymentStatus))]
    public class PremaritalRegistration
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } = Guid.NewGuid();

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

        [Range(1, 300)]
        public int? ChurchId { get; set; }

        [StringLength(100)]
        public string? PriestName { get; set; }

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
