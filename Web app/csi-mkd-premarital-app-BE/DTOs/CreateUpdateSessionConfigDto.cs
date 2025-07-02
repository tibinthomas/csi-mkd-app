using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class CreateUpdateSessionDto
    {
        public int? Id { get; set; }

        public required string SessionName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; }
        
        public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;

        // public string? RowVersion { get; set; }

    }
}
