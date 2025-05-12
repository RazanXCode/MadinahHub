using MHBackend.Data;
using MHBackend.DTOs;
using MHBackend.Models;
using MHBackend.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace MHBackend.Controllers
{
    [Route("communities")]
    [ApiController]
    public class CommunityController : ControllerBase
    {
        private readonly MyAppDbContext _db;
        private readonly IUserRepository _userRepository;
        private readonly Bugsnag.IClient _bugsnag;



        public CommunityController(MyAppDbContext db,   IUserRepository userRepository, Bugsnag.IClient bugsnag)

        {
            _db = db;
            _userRepository = userRepository;
            _bugsnag = bugsnag;
        }

        // POST: communities/createCommunity
        [HttpPost("createCommunity")]
        public async Task<IActionResult> CreateCommunity([FromBody] CreateCommunityDto community)
        {
            try
            {
                var newCommunity = new Community
                {
                    PublicCommunityId = Guid.NewGuid().ToString(),
                    Name = community.Name,
                    Description = community.Description,
                    CreatedAt = DateTime.UtcNow,
                    ImageUrl = community.ImageUrl,
                    MemberCount = 0 // initially 0 members
                };

                _db.Communities.Add(newCommunity);
                await _db.SaveChangesAsync();

                // Return the created community 
                return CreatedAtAction(
                    nameof(GetCommunity),
                    new { publicCommunityId = newCommunity.PublicCommunityId },
                    new CommunityDto
                    {
                        PublicCommunityId = newCommunity.PublicCommunityId,
                        Name = newCommunity.Name,
                        Description = newCommunity.Description,
                        MemberCount = newCommunity.MemberCount,
                        CreatedAt = newCommunity.CreatedAt,
                        ImageUrl = newCommunity.ImageUrl
                    });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while creating the community");
            }

        }

        // GET: communities/getCommunity/{publicCommunityId}
        [HttpGet("getCommunity/{publicCommunityId}")]
        public async Task<IActionResult> GetCommunity(string publicCommunityId)
        {
            var community = await _db.Communities
                .Where(c => c.PublicCommunityId == publicCommunityId)
                .Select(c => new CommunityDto
                {
                    PublicCommunityId = c.PublicCommunityId,
                    Name = c.Name,
                    Description = c.Description,
                    MemberCount = c.MemberCount,
                    CreatedAt = c.CreatedAt,
                    ImageUrl = c.ImageUrl
                })
                .FirstOrDefaultAsync();
            if (community == null)
            {
                return NotFound();
            }
            return Ok(community);
        }

        // GET: communities/getAllCommunities
        [HttpGet("getAllCommunities")]
        public async Task<IActionResult> GetAllCommunities()
        {
            // Grt current user from token
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized("User not authenticated");

            var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);

            var communities = await _db.Communities
                .Select(c => new CommunityDto
                {
                    PublicCommunityId = c.PublicCommunityId,
                    Name = c.Name,
                    Description = c.Description,
                    MemberCount = c.MemberCount,
                    CreatedAt = c.CreatedAt,
                    ImageUrl = c.ImageUrl,
                    IsMember = _db.UserCommunities.Any(uc => uc.CommunityId == c.CommunityId && uc.UserId == user.UserId)
                })
                .ToListAsync();
            return Ok(communities);
        }

        // PUT: communities/updateCommunity/{publicCommunityId}
        [HttpPut("updateCommunity/{publicCommunityId}")]
        public async Task<IActionResult> UpdateCommunity(string publicCommunityId, [FromBody] CreateCommunityDto community)
        {
            var existingCommunity = await _db.Communities
                .FirstOrDefaultAsync(c => c.PublicCommunityId == publicCommunityId);
            if (existingCommunity == null)
            {
                return NotFound();
            }
            existingCommunity.Name = community.Name;
            existingCommunity.Description = community.Description;
            existingCommunity.ImageUrl = community.ImageUrl;
            await _db.SaveChangesAsync();
            return Ok("Community updated successfully");
        }


        // DELETE: communities/deleteCommunity/{publicCommunityId}
        [HttpDelete("deleteCommunity/{publicCommunityId}")]
        public async Task<IActionResult> DeleteCommunity(string publicCommunityId)
        {
            var community = await _db.Communities
                .FirstOrDefaultAsync(c => c.PublicCommunityId == publicCommunityId);
            if (community == null)
            {
                return NotFound();
            }
            _db.Communities.Remove(community);
            await _db.SaveChangesAsync();
            return Ok("community deleted successfully");
        }
       
        // POST: communities/joinCommunity
        [HttpPost("joinCommunity/{publicCommunityId}")]
        public async Task<IActionResult> JoinCommunity(string publicCommunityId)
        {

            // Grt current user from token
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized("User not authenticated");

            var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);


            var community = await _db.Communities
                .FirstOrDefaultAsync(c => c.PublicCommunityId == publicCommunityId);
            if (community == null)
            {
                _bugsnag.Notify(new Exception($"Community not found with: {publicCommunityId}"));
                return NotFound("Community not found");
            }

            // Check if user already joined
            var existingJoin = await _db.UserCommunities
                .AnyAsync(uc => uc.UserId == user.UserId && uc.CommunityId == community.CommunityId);
            if (existingJoin)
                return BadRequest("User already in community");

            var userJoin = new UserCommunity
            {
                UserId = user.UserId,
                CommunityId = community.CommunityId,
                JoinDate = DateTime.UtcNow
            };

            _db.UserCommunities.Add(userJoin);
            // Increment member count 
            community.MemberCount++;
            await _db.SaveChangesAsync();


            return Ok(new { message = "Joined community" });

        }


        // POST: communities/leaveCommunity
        [HttpPost("leaveCommunity/{publicCommunityId}")]
        public async Task<IActionResult> LeaveCommunity(string publicCommunityId)
        {
            // Grt current user from token
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized("User not authenticated");

            var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);

            var community = await _db.Communities
                .FirstOrDefaultAsync(c => c.PublicCommunityId == publicCommunityId);
            if (community == null)
            {
                return NotFound("Community not found");
            }

            // Check if user is a member
            var existingJoin = await _db.UserCommunities
                .FirstOrDefaultAsync(uc => uc.UserId == user.UserId && uc.CommunityId == community.CommunityId);
            if (existingJoin == null)
                return BadRequest("User not in community");

            _db.UserCommunities.Remove(existingJoin);
            // Decrement member count
            community.MemberCount--;
            await _db.SaveChangesAsync();
            return Ok(new { message = "left community" });
        }


        // GET: communities/GetCommunitiesNames
        [HttpGet("GetCommunitiesNames")]
        public async Task<IActionResult> GetCommunitiesNames()
        {
            var communities = await _db.Communities
                .Select(c => new { c.CommunityId, c.Name })
                .ToListAsync();
            return Ok(communities);
        }


        //GET: community/events
        [HttpGet("events/{publicCommunityId}")]
        public async Task<IActionResult> GetCommunityEvents(string publicCommunityId)
        {
            //Check if community exists
            var community = await _db.Communities
                .FirstOrDefaultAsync(c => c.PublicCommunityId == publicCommunityId);
            if (community == null)
                return NotFound();

            //Get events for the community
            var events = await _db.Events
           .Where(e => e.Community.CommunityId == community.CommunityId)
            .Select(e => new CommunityEventDto
            {
            PublicEventId = e.PublicEventId,
            Title = e.Title,
            Description = e.Description,
            Location = e.Location,
            StartDate = e.StartDate,
            Status = e.Status.ToString(),
            ImageUrl = e.ImageUrl,
            Capacity = e.Capacity,
            EventType = e.EventType.ToString()
            }).ToListAsync();
            return Ok(events);
        }


        // GET: api/communities/my-communities
        [HttpGet("user-communities")]
        public async Task<IActionResult> GetUserCommunities()
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized("User not authenticated");

            var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);

            var communityIds = await _db.UserCommunities
                .Where(uc => uc.UserId == user.UserId)
                .Select(uc => uc.Community.CommunityId)
                .ToListAsync();

            return Ok(communityIds);
        }






    }
}
