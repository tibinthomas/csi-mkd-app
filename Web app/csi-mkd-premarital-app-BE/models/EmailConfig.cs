using System.ComponentModel.DataAnnotations;

namespace csi_mkd_premarital_app_BE.Models
{
    public class EmailConfig
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string SenderEmail { get; set; } = "";
        [Required]
        public string SenderPassword { get; set; } = "";

        [Required]
        public string EmailSubject { get; set; } = "Registration Confirmation";

        // Use placeholders like {Name} in the body template
        [Required]
        public string EmailBodyTemplate { get; set; } = "<h3>Hello {Name},</h3><p>Thank you for registering.</p>";
    }

}
