using MHBackend.Data;
using MHBackend.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MHBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

        private readonly MyAppDbContext _context;

        public UserController(MyAppDbContext context)
        {
            _context = context;
        }

        // Get api/user: Return all users with details
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDto
                {
                    PublicUserId = u.PublicUserId,
                    UserName = u.UserName,
                    Address = u.Address,
                    PhoneNumber = u.PhoneNumber,
                    Role = u.Role.ToString(),
                    CreatedAt = u.CreatedAt
                }).ToListAsync();

            return Ok(users);
        }

        // Get api/user/{publicUserId} : Return a specific user with details
        [HttpGet("{publicUserId}")]
        public async Task<ActionResult<UserDto>> GetUser(string publicUserId)
        {
            var user = await _context.Users
                .Where(u => u.PublicUserId == publicUserId)
                .Select(u => new UserDto
                {
                    PublicUserId = u.PublicUserId,
                    UserName = u.UserName,
                    Address = u.Address,
                    PhoneNumber = u.PhoneNumber,
                    Role = u.Role.ToString(),
                    CreatedAt = u.CreatedAt
                }).FirstOrDefaultAsync();

            if (user == null) return NotFound();

            return Ok(user);
        }


        // Get api/user/{publicUserId}/communities : Get communities the user is joining
        [HttpGet("{publicUserId}/communities")]
        public async Task<ActionResult<IEnumerable<UserCommunityDto>>> GetUserCommunities(string publicUserId)
        {
            var user = await _context.Users
                .Include(u => u.UserCommunities)
                    .ThenInclude(uc => uc.Community)
                .FirstOrDefaultAsync(u => u.PublicUserId == publicUserId);

            if (user == null) return NotFound();

            var communities = user.UserCommunities
                .Select(uc => new UserCommunityDto
                {
                    PublicCommunityId = uc.Community.PublicCommunityId,
                    Name = uc.Community.Name,
                    Description = uc.Community.Description,
                    MemberCount = uc.Community.MemberCount,
                    CreatedAt = uc.Community.CreatedAt,
                    ImageUrl = uc.Community.ImageUrl,
                    JoinDate = uc.JoinDate
                });

            return Ok(communities);
        }



        // Get api/user/{publicUserId}/booked-events: Get events that the user booked
        [HttpGet("{publicUserId}/booked-events")]
        public async Task<ActionResult<IEnumerable<UserEventDto>>> GetUserBookedEvents(string publicUserId)
        {
            var user = await _context.Users
                .Include(u => u.Bookings)
                    .ThenInclude(b => b.Ticket)
                        .ThenInclude(t => t.Event)
                            .ThenInclude(e => e.Community)
                .FirstOrDefaultAsync(u => u.PublicUserId == publicUserId);

            if (user == null)
                return NotFound("User not found");

            var bookedEvents = user.Bookings
                .Where(b => b.Ticket != null && b.Ticket.Event != null)
                .Select(b => b.Ticket.Event)
                .Distinct()
                .Select(e => new UserEventDto
                {
                    PublicEventId = e.PublicEventId,
                    Title = e.Title,
                    Description = e.Description,
                    Location = e.Location,
                    Capacity = e.Capacity,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    Status = e.Status.ToString(),
                    EventType = e.EventType.ToString(),
                    CreatedAt = e.CreatedAt,
                    ImageUrl = e.ImageUrl,
                    CommunityName = e.Community?.Name ?? ""
                })
                .ToList();

            return Ok(bookedEvents);
        }




        // Get api/user/{publicUserId}/tickets: Get tickets the user has
        [HttpGet("{publicUserId}/tickets")]
        public async Task<ActionResult<IEnumerable<UserTicketDto>>> GetUserTickets(string publicUserId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.PublicUserId == publicUserId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            var tickets = await _context.Tickets
                .Include(t => t.Booking)
                .Include(t => t.Event)
                    .ThenInclude(e => e.Community)
                .Where(t => t.Booking.UserId == user.UserId)
                .Select(t => new UserTicketDto
                {
                    PublicTicketId = t.PublicTicketId,
                    QRCode = t.QRCode,
                    CreatedAt = t.CreatedAt,
                    Status = t.Status.ToString(),
                    EventTitle = t.Event.Title,
                    CommunityName = t.Event.Community.Name,
                    PublicBookingId = t.Booking.PublicBookingId // Added this line 
                })
                .ToListAsync();

            return Ok(tickets);
        }






    }
}
