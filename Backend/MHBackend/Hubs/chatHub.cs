using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using MHBackend.Models;
using MHBackend.Data;
using MHBackend.Repositories;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.Extensions.Logging;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authorization;

namespace MHBackend.Hubs
{
    [Authorize] // Add this to require authorization for the hub
    public class ChatHub : Hub
    {
        private readonly MyAppDbContext _context;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(MyAppDbContext context, IUserRepository userRepository, ILogger<ChatHub> logger)
        {
            _context = context;
            _userRepository = userRepository;
            _logger = logger;
        }

        // Get the current user without relying on the HttpContext
        private async Task<User> GetCurrentUserAsync()
        {
            try
            {
                var firebaseUid = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(firebaseUid))
                {
                    _logger.LogWarning("Firebase UID not found in user claims");
                    throw new HubException("User not authenticated");
                }

                var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);
                if (user == null)
                {
                    _logger.LogWarning($"User not found for Firebase UID: {firebaseUid}");
                    throw new HubException("User not found in database");
                }

                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                throw new HubException("Error retrieving user information");
            }
        }

        // Connect to a specific community chat
        public async Task JoinCommunity(string communityId)
        {
            try
            {
                // Verify user exists first
                await GetCurrentUserAsync();
                
                _logger.LogInformation($"User joining community: {communityId}");
                await Groups.AddToGroupAsync(Context.ConnectionId, communityId);
                _logger.LogInformation($"User joined community: {communityId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error joining community: {communityId}");
                throw new HubException($"Error joining community: {ex.Message}");
            }
        }

        // Leave a specific community chat
        public async Task LeaveCommunity(string communityId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, communityId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error leaving community: {communityId}");
                throw new HubException($"Error leaving community: {ex.Message}");
            }
        }

        // Send a message to a specific community
        public async Task SendMessage(string communityPublicId, string content)
        {
            try
            {
                // Get authenticated user
                var user = await GetCurrentUserAsync();

                // Find the community
                var community = await _context.Communities
                    .FirstOrDefaultAsync(c => c.PublicCommunityId == communityPublicId);
                
                if (community == null)
                {
                    _logger.LogWarning($"Community not found: {communityPublicId}");
                    throw new HubException("Community not found");
                }

                // Check if user is a member of the community
                var isMember = await _context.UserCommunities
                    .AnyAsync(uc => uc.UserId == user.UserId && uc.CommunityId == community.CommunityId);
                
                if (!isMember)
                {
                    _logger.LogWarning($"User {user.PublicUserId} is not a member of community {communityPublicId}");
                    throw new HubException("You must be a member of this community to send messages");
                }

                // Create and save the message
                var message = new Message
                {
                    PublicMessageId = Guid.NewGuid().ToString(),
                    Content = content,
                    Timestamp = DateTime.UtcNow,
                    Status = MessageStatus.Delivered,
                    UserId = user.UserId,
                    CommunityId = community.CommunityId
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                // Broadcast the message to all clients in the community group
                await Clients.Group(communityPublicId).SendAsync("ReceiveMessage", new
                {
                    MessageId = message.PublicMessageId,
                    Content = message.Content,
                    Timestamp = message.Timestamp,
                    UserName = user.UserName,
                    UserId = user.PublicUserId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending message to community {communityPublicId}");
                throw new HubException($"Error sending message: {ex.Message}");
            }
        }

        // Get recent messages for a community
        public async Task<List<object>> GetRecentMessages(string communityPublicId, int count = 50)
        {
            try
            {
                // Verify authentication before proceeding
                await GetCurrentUserAsync();
                
                _logger.LogInformation($"Getting recent messages for community: {communityPublicId}");
                
                if (string.IsNullOrEmpty(communityPublicId))
                {
                    _logger.LogWarning("Community ID is null or empty");
                    return new List<object>(); // Return empty list instead of throwing
                }

                var community = await _context.Communities
                    .FirstOrDefaultAsync(c => c.PublicCommunityId == communityPublicId);
                
                if (community == null)
                {
                    _logger.LogWarning($"Community not found: {communityPublicId}");
                    return new List<object>(); // Return empty list instead of throwing
                }

                var messages = await _context.Messages
                    .Where(m => m.CommunityId == community.CommunityId && m.Status == MessageStatus.Delivered)
                    .OrderByDescending(m => m.Timestamp)
                    .Take(count)
                    .Include(m => m.User)
                    .Select(m => new
                    {
                        MessageId = m.PublicMessageId,
                        Content = m.Content,
                        Timestamp = m.Timestamp,
                        UserName = m.User.UserName,
                        UserId = m.User.PublicUserId
                    })
                    .ToListAsync();

                _logger.LogInformation($"Retrieved {messages.Count} messages for community {communityPublicId}");
                return messages.OrderBy(m => m.Timestamp).Cast<object>().ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving messages for community {communityPublicId}");
                // Return an empty list instead of throwing exception
                return new List<object>();
            }
        }

        // Delete a message
        public async Task DeleteMessage(string messagePublicId)
        {
            try
            {
                // Get authenticated user
                var user = await GetCurrentUserAsync();

                // Find the message
                var message = await _context.Messages
                    .Include(m => m.Community)
                    .FirstOrDefaultAsync(m => m.PublicMessageId == messagePublicId);
                
                if (message == null)
                {
                    _logger.LogWarning($"Message not found: {messagePublicId}");
                    throw new HubException("Message not found");
                }

                // Check if user is the message author or an admin
                if (message.UserId != user.UserId && user.Role != Role.Admin)
                {
                    _logger.LogWarning($"User {user.PublicUserId} does not have permission to delete message {messagePublicId}");
                    throw new HubException("You don't have permission to delete this message");
                }

                // Mark message as deleted
                message.Status = MessageStatus.Deleted;
                await _context.SaveChangesAsync();

                // Notify clients about the deleted message
                await Clients.Group(message.Community.PublicCommunityId).SendAsync("MessageDeleted", messagePublicId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting message {messagePublicId}");
                throw new HubException($"Error deleting message: {ex.Message}");
            }
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var user = await GetCurrentUserAsync();
                _logger.LogInformation($"User {user.UserName} ({user.PublicUserId}) connected: {Context.ConnectionId}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Connection established but failed to identify user: {ex.Message}");
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _logger.LogInformation($"Client disconnected: {Context.ConnectionId}");
            if (exception != null)
            {
                _logger.LogError(exception, "Disconnection error");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}