using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace MHBackend.Services
{
    public class SmsService : ISmsService
    {
        private readonly TwilioSettings _twilioSettings;
        private readonly ILogger<SmsService> _logger;

        public SmsService(IOptions<TwilioSettings> twilioSettings, ILogger<SmsService> logger)
        {
            _twilioSettings = twilioSettings.Value;
            _logger = logger;
            TwilioClient.Init(_twilioSettings.AccountSid, _twilioSettings.AuthToken);
        }

        public async Task<SmsResponse> SendAsync(string phoneNumber, string message)
        {
            try
            {
                // Ensure phone number is in E.164 format
                if (!phoneNumber.StartsWith("+"))
                {
                    phoneNumber = "+" + phoneNumber;
                }

                var messageOptions = new CreateMessageOptions(
                    new PhoneNumber(phoneNumber))
                {
                    From = new PhoneNumber(_twilioSettings.PhoneNumber),
                    Body = message
                };

                var twilioMessage = await MessageResource.CreateAsync(messageOptions);

                _logger.LogInformation("SMS sent to {PhoneNumber}, SID: {MessageSid}, Status: {Status}",
                    phoneNumber, twilioMessage.Sid, twilioMessage.Status);

                // Map Twilio response to our SmsResponse object
                return new SmsResponse
                {
                    MessageId = twilioMessage.Sid,
                    Status = twilioMessage.Status.ToString(),
                    To = twilioMessage.To,
                    ErrorMessage = twilioMessage.ErrorMessage,
                    Success = twilioMessage.Status != MessageResource.StatusEnum.Failed
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending SMS to {PhoneNumber}", phoneNumber);

                // Return failure response
                return new SmsResponse
                {
                    Status = "failed",
                    To = phoneNumber,
                    ErrorMessage = ex.Message,
                    Success = false
                };
            }
        }
    }

    public class TwilioSettings
    {
        public string AccountSid { get; set; }
        public string AuthToken { get; set; }
        public string PhoneNumber { get; set; }
    }
}