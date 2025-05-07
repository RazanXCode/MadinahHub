using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System.IO;
using System.Threading.Tasks;

namespace MHBackend.Services
{
    public interface IEmailService
    {
        Task SendTicketEmailAsync(string toEmail, string subject, string htmlBody, byte[] qrCodeBytes, string attachmentName);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendTicketEmailAsync(string toEmail, string subject, string htmlBody, byte[] qrCodeBytes, string attachmentName)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _configuration["Email:SenderName"],
                _configuration["Email:SenderAddress"]
            ));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };

            // Add QR code as attachment
            if (qrCodeBytes != null)
            {
                builder.Attachments.Add(attachmentName, qrCodeBytes, new ContentType("image", "png"));
            }

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _configuration["Email:SmtpHost"],
                int.Parse(_configuration["Email:SmtpPort"]),
                SecureSocketOptions.StartTls
            );

            await client.AuthenticateAsync(
                _configuration["Email:SmtpUser"],
                _configuration["Email:SmtpPass"]
            );

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
