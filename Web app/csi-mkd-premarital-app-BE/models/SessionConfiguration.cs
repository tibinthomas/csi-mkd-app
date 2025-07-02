using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.Models
{
    public class SessionConfiguration
    {

        public int Id { get; set; }
        public required string SessionName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;

        // [Timestamp]
        // [Column(TypeName = "bytea")]
        // public byte[] RowVersion { get; set; } = Array.Empty<byte>(); // Prevents null

    }
}
