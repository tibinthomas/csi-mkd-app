using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.Models
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        [Required]
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}
