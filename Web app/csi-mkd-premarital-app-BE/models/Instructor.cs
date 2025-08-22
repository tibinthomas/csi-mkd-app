using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.Models
{
    public class Instructor : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Qualification { get; set; } = string.Empty;
    }
}