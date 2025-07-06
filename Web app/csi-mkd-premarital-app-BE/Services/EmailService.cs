using System.Net;
using System.Net.Mail;
using csi_mkd_premarital_app_BE.Data;

namespace csi_mkd_premarital_app_BE.Services
{
    public class EmailService
    {
        private readonly ApplicationDbContext _db;

        // Fixed SMTP settings (e.g., Gmail)
        private const string SmtpHost = "smtp.gmail.com";
        private const int SmtpPort = 587;

        public EmailService(ApplicationDbContext db)
        {
            _db = db;
        }

        public void SendConfirmationEmail(string toEmail, string userName)
        {
            var config = _db.EmailConfigs.FirstOrDefault();
            if (config == null)
                throw new Exception("Email configuration not found.");

            var body = config.EmailBodyTemplate.Replace("{Name}", userName);

            var message = new MailMessage();
            message.From = new MailAddress(config.SenderEmail, "CSI MKD");
            message.To.Add(new MailAddress(toEmail));
            message.Subject = config.EmailSubject;
            message.Body = body;
            message.IsBodyHtml = true;

            using var client = new SmtpClient(SmtpHost, SmtpPort)
            {
                Credentials = new NetworkCredential(config.SenderEmail, config.SenderPassword),
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            client.Send(message);
        }

    }

}
