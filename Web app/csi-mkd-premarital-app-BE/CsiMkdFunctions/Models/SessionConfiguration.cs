using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace CsiMkdFunctions.Models
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
    }
}