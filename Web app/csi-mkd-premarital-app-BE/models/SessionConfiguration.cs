using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Models
{
    [Index(nameof(StartDate))]
    [Index(nameof(IsActive))]
    public class SessionConfiguration
    {

        public int Id { get; set; }
        [Required]
        public required string SessionName { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;
        public ICollection<PremaritalRegistration> PremaritalRegistrations { get; set; } = new List<PremaritalRegistration>();

        // [Timestamp]
        // [Column(TypeName = "bytea")]
        // public byte[] RowVersion { get; set; } = Array.Empty<byte>(); // Prevents null

    }
}
