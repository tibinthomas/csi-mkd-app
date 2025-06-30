using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class SessionConfigurationDto
    {
        public int Id { get; set; }
        public required string SessionName { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime SubmittedDate { get; set; }

        // [Timestamp]
        // [Column(TypeName = "bytea")]
        // public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }
}
