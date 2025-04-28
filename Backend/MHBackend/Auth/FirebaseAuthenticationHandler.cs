using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace MHBackend.Auth
{
    public class FirebaseAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public FirebaseAuthenticationHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.ContainsKey("Authorization"))
            {
                return AuthenticateResult.Fail("Authorization header not found.");
            }

            string bearerToken = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(bearerToken) || !bearerToken.StartsWith("Bearer "))
            {
                return AuthenticateResult.Fail("Bearer token not found.");
            }

            string token = bearerToken.Substring(7);

            try
            {
                var firebaseToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, firebaseToken.Uid),
                    new Claim(ClaimTypes.Email, firebaseToken.Claims.ContainsKey("email") ? firebaseToken.Claims["email"].ToString() : "")
                };

                var identity = new ClaimsIdentity(claims, Scheme.Name);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, Scheme.Name);

                return AuthenticateResult.Success(ticket);
            }
            catch (Exception ex)
            {
                return AuthenticateResult.Fail($"Invalid token: {ex.Message}");
            }
        }
    }
}