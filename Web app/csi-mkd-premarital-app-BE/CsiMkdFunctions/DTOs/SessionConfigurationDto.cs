using System;

namespace CsiMkdFunctions.DTOs
{
    public class SessionConfigurationDto
    {
        public int Id { get; set; }
        public required string SessionName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime SubmittedDate { get; set; }
    }
}