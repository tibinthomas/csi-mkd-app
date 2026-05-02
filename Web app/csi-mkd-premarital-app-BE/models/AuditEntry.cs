using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.Models
{
    public class AuditEntry
    {
        public int Id { get; set; }
        [Required]
        public required string TableName { get; set; }
        [Required]
        public required string ActionType { get; set; } // Insert / Update / Delete
        [Required]
        public DateTime Timestamp { get; set; }
        public string? UserId { get; set; }     // If available (from auth)
        public string? KeyValues { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        // public byte[] RowVersion { get; set; } = default!;

    }
}
