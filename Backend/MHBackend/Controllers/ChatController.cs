using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MHBackend.DTOs;
using MHBackend.Repositories;
using MHBackend.Services;
using System.Security.Claims;

namespace MHBackend.Controllers
{
    [ApiController]
    [Route("api/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IUserRepository _userRepository;

        public ChatController(IChatService chatService, IUserRepository userRepository)
        {
            _chatService = chatService;
            _userRepository = userRepository;
        }

        [HttpGet("community/{communityPublicId}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetCommunityMessages(string communityPublicId, [FromQuery] int count = 50)
        {
            try
            {
                var messages = await _chatService.GetCommunityMessages(communityPublicId, count);
                return Ok(messages);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("community/{communityPublicId}")]
        public async Task<ActionResult> SendMessage(string communityPublicId, [FromBody] CreateMessageDto messageDto)
        {
            try
            {
                // Get current user from Firebase claims
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                    return Unauthorized("User not authenticated");

                var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);
                if (user == null)
                    return NotFound("User not found");

                var message = await _chatService.SaveMessage(communityPublicId, user.PublicUserId, messageDto.Content);

                return Ok(new { 
                    messageId = message.PublicMessageId,
                    content = message.Content,
                    timestamp = message.Timestamp
                });
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("message/{messagePublicId}")]
        public async Task<ActionResult> DeleteMessage(string messagePublicId)
        {
            try
            {
                // Get current user from Firebase claims
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                    return Unauthorized("User not authenticated");

                var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);
                if (user == null)
                    return NotFound("User not found");

                await _chatService.DeleteMessage(messagePublicId, user.PublicUserId);
                return Ok(new { message = "Message deleted successfully" });
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}