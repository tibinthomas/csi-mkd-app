namespace csi_mkd_premarital_app_BE.Models
{
    public class EmailConfig
    {
        public int Id { get; set; }

        public string SenderEmail { get; set; } = "";
        public string SenderPassword { get; set; } = "";

        public string EmailSubject { get; set; } = "Registration Confirmation";

        // Use placeholders like {Name} in the body template
        public string EmailBodyTemplate { get; set; } = "<h3>Hello {Name},</h3><p>Thank you for registering.</p>";
    }

}
