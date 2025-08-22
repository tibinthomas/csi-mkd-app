using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class InstructorDto
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Qualification { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}