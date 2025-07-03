using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;

namespace csi_mkd_premarital_app_BE.Services
{
    public class EmailService
    {
        private readonly string? _apiKey;

        public EmailService(IConfiguration configuration)
        {
            _apiKey = configuration["SendGrid:ApiKey"]; // Read from config
        }

        public async Task SendConfirmationEmail(string toEmail, string name)
        {
            var client = new SendGridClient(_apiKey);
            var from = new EmailAddress("teenanikhil496@gmail.com", "CSI MKD Premarital App");
            var subject = "Registration Confirmation";
            var to = new EmailAddress(toEmail, name);
            var plainTextContent = $"Hi {name},\n\nThank you for registering!";
            var htmlContent = $"<p>Hi {name},</p><p>Thank you for registering!</p>";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            Console.WriteLine($"Sending email to {msg}...");
            var response = await client.SendEmailAsync(msg);

            Console.WriteLine($"Status Code: {response.StatusCode}");
        }
    }
}
