using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Models
{
    [Index(nameof(Id))]
    [Index(nameof(SubmittedAt))]
    public class PremaritalOutsideKeralaRegistration
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Range(1, 300)]
        public int? ChurchId { get; set; }

        [Required]
        public DateTimeOffset SessionStartDate { get; set; }

        [Required]
        public DateTimeOffset SessionEndDate { get; set; }

        public string? PriestName { get; set; }

        public TimeZoneOption? TimeZone { get; set; }


        public ICollection<ParticipantOutsideKerala> Participants { get; set; } = new List<ParticipantOutsideKerala>();

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public PremaritalOutsideKeralaDocument? PremaritalOutsideKeralaDocument { get; set; }
    }
}
