using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class CreateInstructorDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Qualification { get; set; } = string.Empty;
    }

    public class UpdateInstructorDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Qualification { get; set; } = string.Empty;
    }

    // Keep the old DTO for backward compatibility during transition
    public class CreateUpdateInstructorDto
    {
        public int? Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Qualification { get; set; } = string.Empty;
    }
}