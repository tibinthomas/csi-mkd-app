using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class CreateUpdateSessionDto
    {
        public int? Id { get; set; }

        public required string SessionName { get; set; }

        public int Year { get; set; }

        public int Month { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        // public string? RowVersion { get; set; }

    }
}
