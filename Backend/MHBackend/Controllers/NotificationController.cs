using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using MHBackend.Models; 
using MHBackend.Data; 
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MHBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly MyAppDbContext _context;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(
            MyAppDbContext context,
            ILogger<NotificationController> logger) 
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("register-device")]
        public async Task<IActionResult> RegisterDevice([FromBody] DeviceRegistration registration)
        {
            if (string.IsNullOrEmpty(registration.UserId) || string.IsNullOrEmpty(registration.Token))
            {
                return BadRequest(new { message = "UserId and Token are required" });
            }

            try
            {
                // Get the user to make sure they exist and to get their ID
                var user = await _context.Users.FirstOrDefaultAsync(u => u.PublicUserId == registration.UserId);
                
                if (user == null)
                {
                    _logger.LogWarning("User with PublicUserId {PublicUserId} not found when registering device", registration.UserId);
                    return NotFound(new { message = "User not found" });
                }
                
                // Check if the token is already registered
                var existingToken = await _context.DeviceTokens
                    .Where(t => t.UserPublicId == registration.UserId && t.Token == registration.Token)
                    .FirstOrDefaultAsync();
                
                if (existingToken != null)
                {
                    // Update last updated timestamp
                    existingToken.LastUpdated = DateTime.UtcNow;
                    existingToken.IsActive = true;
                }
                else
                {
                    // Create new token entry
                    _context.DeviceTokens.Add(new DeviceToken
                    {
                        Token = registration.Token,
                        UserPublicId = registration.UserId,
                        UserId = user.UserId,
                        LastUpdated = DateTime.UtcNow,
                        IsActive = true
                    });
                }
                
                await _context.SaveChangesAsync();
                _logger.LogInformation("Registered device token for user {UserId}", registration.UserId);
                
                return Ok(new { message = "Device registered successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering device for user {UserId}", registration.UserId);
                return StatusCode(500, new { message = "Error registering device" });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(string userId)
        {
            try
            {
                var userIdValue = 0;
                int.TryParse(userId, out userIdValue);
                
                if (userIdValue == 0)
                {
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.PublicUserId == userId);
                    if (user != null)
                    {
                        userIdValue = user.UserId;
                    }
                    else
                    {
                        return NotFound(new { message = "User not found" });
                    }
                }
                
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userIdValue)
                    .OrderByDescending(n => n.Timestamp)
                    .Select(n => new
                    {
                        n.PublicNotificationId,
                        n.Content,
                        n.Timestamp,
                        n.BookingId
                    })
                    .ToListAsync();
                
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notifications for user {UserId}", userId);
                return StatusCode(500, new { message = "Error retrieving notifications" });
            }
        }
    }

    public class DeviceRegistration
    {
        public string UserId { get; set; }
        public string Token { get; set; }
    }
}