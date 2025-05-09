using MHBackend.Data;
using MHBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using FirebaseAdmin.Messaging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace MHBackend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly MyAppDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            MyAppDbContext context,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task CreateNotificationAsync(int userId, string content, int? bookingId = null)
        {
            try
            {
                // Use fully qualified name for Notification
                var notification = new MHBackend.Models.Notification
                {
                    PublicNotificationId = Guid.NewGuid().ToString(),
                    Content = content,
                    Timestamp = DateTime.UtcNow,
                    UserId = userId,
                    BookingId = bookingId ?? 0
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Created notification for user {userId}: {content}");
                
                // Send push notification
                await SendPushNotificationAsync(userId, "MadinahHub", content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating notification for user {userId}");
            }
        }

        public async Task CreateBookingNotificationAsync(int userId, int bookingId, string status)
        {
            string content = $"Your booking status has been updated to: {status}";
            await CreateNotificationAsync(userId, content, bookingId);
        }

        private async Task<bool> SendPushNotificationAsync(int userId, string title, string body)
        {
            try
            {
                // Get user's FCM token from database
                var user = await _context.Users.FindAsync(userId);
                if (user == null) 
                {
                    _logger.LogWarning($"User {userId} not found when sending push notification");
                    return false;
                }
                
                // Find the active device token(s) for this user
                var deviceTokens = await _context.DeviceTokens
                    .Where(dt => dt.UserId == userId && dt.IsActive)
                    .OrderByDescending(dt => dt.LastUpdated)
                    .ToListAsync();
                
                if (!deviceTokens.Any())
                {
                    _logger.LogInformation($"No device tokens found for user {userId}");
                    return false;
                }
                
                bool anySent = false;
                
                // Send to all user devices
                foreach (var deviceToken in deviceTokens)
                {
                    try
                    {
                        // Create and send Firebase message
                        var message = new FirebaseAdmin.Messaging.Message
                        {
                            Token = deviceToken.Token,
                            Notification = new FirebaseAdmin.Messaging.Notification
                            {
                                Title = title,
                                Body = body
                            },
                            Android = new AndroidConfig
                            {
                                Priority = Priority.High,
                                Notification = new AndroidNotification
                                {
                                    ClickAction = "FLUTTER_NOTIFICATION_CLICK",
                                    Sound = "default"
                                }
                            },
                            Apns = new ApnsConfig
                            {
                                Aps = new Aps
                                {
                                    Sound = "default",
                                    Badge = 1
                                }
                            }
                        };
                        
                        string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                        _logger.LogInformation($"Sent push notification to user {userId}, device {deviceToken.DeviceId}, response: {response}");
                        anySent = true;
                    }
                    catch (FirebaseMessagingException fex)
                    {
                        if (fex.MessagingErrorCode == MessagingErrorCode.Unregistered ||
                            fex.MessagingErrorCode == MessagingErrorCode.InvalidArgument)
                        {
                            // Token is no longer valid, mark as inactive
                            deviceToken.IsActive = false;
                            await _context.SaveChangesAsync();
                            _logger.LogWarning($"Disabled invalid device token for user {userId}: {fex.MessagingErrorCode}");
                        }
                        else
                        {
                            _logger.LogError(fex, $"Firebase error sending push notification to user {userId}: {fex.MessagingErrorCode}");
                        }
                    }
                }
                
                return anySent;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending push notification to user {userId}");
                return false;
            }
        }
    }
}