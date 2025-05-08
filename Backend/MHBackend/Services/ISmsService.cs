using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace MHBackend.Services
{
    public interface ISmsService
    {
        Task<SmsResponse> SendAsync(string phoneNumber, string message);
    }

    public class SmsResponse
    {
        public string Status { get; set; }
        public string MessageId { get; set; }
        public string To { get; set; }
        public string ErrorMessage { get; set; }
        public bool Success { get; set; }
    }
}