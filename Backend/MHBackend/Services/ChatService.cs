using Microsoft.EntityFrameworkCore;
using MHBackend.Data;
using MHBackend.DTOs;
using MHBackend.Models;

namespace MHBackend.Services
{
    public interface IChatService
    {
        Task<IEnumerable<MessageDto>> GetCommunityMessages(string communityPublicId, int count = 50);
        Task<Message> SaveMessage(string communityPublicId, string userPublicId, string content);
        Task<bool> DeleteMessage(string messagePublicId, string userPublicId);
    }

    public class ChatService : IChatService
    {
        private readonly MyAppDbContext _context;

        public ChatService(MyAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MessageDto>> GetCommunityMessages(string communityPublicId, int count = 50)
        {
            var community = await _context.Communities
                .FirstOrDefaultAsync(c => c.PublicCommunityId == communityPublicId);

            if (community == null)
                throw new ArgumentException("Community not found");

            var messages = await _context.Messages
                .Where(m => m.CommunityId == community.CommunityId && m.Status == MessageStatus.Delivered)
                .OrderByDescending(m => m.Timestamp)
                .Take(count)
                .Include(m => m.User)
                .Select(m => new MessageDto
                {
                    MessageId = m.PublicMessageId,
                    Content = m.Content,
                    Timestamp = m.Timestamp,
                    UserName = m.User.UserName,
                    UserPublicId = m.User.PublicUserId
                })
                .ToListAsync();

            return messages.OrderBy(m => m.Timestamp);
        }

        public async Task<Message> SaveMessage(string communityPublicId, string userPublicId, string content)
        {
            var community = await _context.Communities
                .FirstOrDefaultAsync(c => c.PublicCommunityId == communityPublicId);

            if (community == null)
                throw new ArgumentException("Community not found");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.PublicUserId == userPublicId);

            if (user == null)
                throw new ArgumentException("User not found");

            // Check if user is a member of the community
            var isMember = await _context.UserCommunities
                .AnyAsync(uc => uc.UserId == user.UserId && uc.CommunityId == community.CommunityId);

            if (!isMember)
                throw new UnauthorizedAccessException("User is not a member of this community");

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

            return message;
        }

        public async Task<bool> DeleteMessage(string messagePublicId, string userPublicId)
        {
            var message = await _context.Messages
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.PublicMessageId == messagePublicId);

            if (message == null)
                throw new ArgumentException("Message not found");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.PublicUserId == userPublicId);

            if (user == null)
                throw new ArgumentException("User not found");

            // Check if user is the message author or an admin
            if (message.User.PublicUserId != userPublicId && user.Role != Role.Admin)
                throw new UnauthorizedAccessException("You don't have permission to delete this message");

            message.Status = MessageStatus.Deleted;
            await _context.SaveChangesAsync();

            return true;
        }
    }
}