using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text;

namespace MHBackend.Auth
{
    public class FirebaseAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        private readonly ILogger<FirebaseAuthenticationHandler> _logger;

        public FirebaseAuthenticationHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
            _logger = logger.CreateLogger<FirebaseAuthenticationHandler>();
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            string token = null;

            // First, check for Authorization header (used by HTTP requests)
            if (Request.Headers.ContainsKey("Authorization"))
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                {
                    token = authHeader.Substring(7);
                    _logger.LogDebug("Found token in Authorization header");
                }
            }

            // If no token in Authorization header, check query string (used by SignalR)
            if (string.IsNullOrEmpty(token) && Request.QueryString.HasValue)
            {
                var queryString = Request.QueryString.Value;
                if (queryString.Contains("access_token="))
                {
                    var queryParams = System.Web.HttpUtility.ParseQueryString(queryString);
                    token = queryParams["access_token"];
                    _logger.LogDebug("Found token in query string");
                }
            }

            // No token found in either place
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("No Bearer token found in request");
                return AuthenticateResult.Fail("No Bearer token found in request.");
            }

            try
            {
                // Verify token with Firebase
                var firebaseToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                
                // Create claims from Firebase token
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, firebaseToken.Uid),
                };

                // Add email claim if available
                if (firebaseToken.Claims.ContainsKey("email"))
                {
                    claims.Add(new Claim(ClaimTypes.Email, firebaseToken.Claims["email"].ToString()));
                }

                // Create authenticated identity and principal
                var identity = new ClaimsIdentity(claims, Scheme.Name);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, Scheme.Name);

                _logger.LogInformation($"User authenticated: {firebaseToken.Uid}");
                return AuthenticateResult.Success(ticket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying Firebase token");
                return AuthenticateResult.Fail($"Invalid token: {ex.Message}");
            }
        }
    }
}