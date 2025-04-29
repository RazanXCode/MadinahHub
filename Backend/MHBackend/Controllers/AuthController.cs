using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MHBackend.Repositories;
using MHBackend.Models;
using MHBackend.DTOs;

namespace MHBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public AuthController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost("register")]
        [Authorize]
        public async Task<IActionResult> Register([FromBody] CreateUserRequest request)
        {
            // Verify Firebase UID from token matches the request
            string firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (firebaseUid != request.FirebaseUid)
                return Unauthorized("Firebase UID mismatch");

            // Prevent duplicate registrations
            var existingUser = await _userRepository.GetByFirebaseUidAsync(firebaseUid);
            if (existingUser != null)
                return Conflict("User already exists");

            // Generate a unique public ID
            string userIdPublic = GenerateUniquePublicId();

            // Build the new user entity
            var user = new User
            {
                FirebaseUid = firebaseUid,
                Username = request.Username,
                Address = request.Address,
                PhoneNumber = request.PhoneNumber,
                Role = UserRole.Visitor,  // Default role using enum
                UserIdPublic = userIdPublic,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateUserAsync(user);

            // Map to response DTO
            var response = new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Address = user.Address,
                Role = user.Role,
                PhoneNumber = user.PhoneNumber,
                UserIdPublic = user.UserIdPublic,
                CreatedAt = user.CreatedAt
            };

            return CreatedAtAction(nameof(Login), new { id = user.Id }, response);
        }

        [HttpPost("login")]
        [Authorize]
        public async Task<IActionResult> Login()
        {
            // Token validation is handled by the authentication middleware
            if (!User.Identity.IsAuthenticated)
                return Unauthorized("Invalid token");

            string firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);

            if (user == null)
                return NotFound("User not found in database. Please register first.");

            var response = new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Address = user.Address,
                Role = user.Role,
                PhoneNumber = user.PhoneNumber,
                UserIdPublic = user.UserIdPublic,
                CreatedAt = user.CreatedAt
            };

            return Ok(response);
        }

        // Helper method to generate a unique public ID
        private string GenerateUniquePublicId()
        {
            // Generate a unique ID using a combination of timestamp and random values
            return $"usr_{DateTime.UtcNow.Ticks}_{Guid.NewGuid().ToString("N").Substring(0, 8)}";
        }
    }
}