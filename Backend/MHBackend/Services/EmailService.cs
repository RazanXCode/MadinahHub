using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using System;
using System.IO;
using System.Threading.Tasks;

namespace MHBackend.Services
{
    public interface IEmailService
    {
        Task<bool> SendTicketEmailAsync(string toEmail, string subject, string htmlBody, byte[] qrCodeBytes, string attachmentName);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendTicketEmailAsync(string toEmail, string subject, string htmlBody, byte[] qrCodeBytes, string attachmentName)
        {
            try
            {
                // Validate SMTP configuration
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPortStr = _configuration["Email:SmtpPort"];
                var smtpUser = _configuration["Email:SmtpUser"];
                var smtpPass = _configuration["Email:SmtpPass"];
                var senderName = _configuration["Email:SenderName"];
                var senderAddress = _configuration["Email:SenderAddress"];

                // Check for null or empty configuration values
                if (string.IsNullOrWhiteSpace(smtpHost) || string.IsNullOrWhiteSpace(smtpPortStr) ||
                    string.IsNullOrWhiteSpace(smtpUser) || string.IsNullOrWhiteSpace(smtpPass) ||
                    string.IsNullOrWhiteSpace(senderAddress))
                {
                    _logger.LogError("Email service configuration is incomplete. Check your appsettings.json file.");
                    return false;
                }

                // Parse port number
                if (!int.TryParse(smtpPortStr, out int smtpPort))
                {
                    _logger.LogError($"Invalid SMTP port number: {smtpPortStr}");
                    return false;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderName ?? "Event System", senderAddress));
                message.To.Add(MailboxAddress.Parse(toEmail));
                message.Subject = subject;

                var builder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };

                // Add QR code as attachment
                if (qrCodeBytes != null)
                {
                    builder.Attachments.Add(attachmentName ?? "qrcode.png", qrCodeBytes, new ContentType("image", "png"));
                }

                message.Body = builder.ToMessageBody();

                using var client = new SmtpClient();
                
                _logger.LogInformation($"Connecting to SMTP server {smtpHost}:{smtpPort}");
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);

                _logger.LogInformation("Authenticating with SMTP server");
                await client.AuthenticateAsync(smtpUser, smtpPass);

                _logger.LogInformation($"Sending email to {toEmail}");
                await client.SendAsync(message);
                
                _logger.LogInformation("Email sent successfully");
                await client.DisconnectAsync(true);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email: {ex.Message}");
                return false;
            }
        }
    }
}