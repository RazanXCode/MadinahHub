using MHBackend.Data;
using MHBackend.DTOs;
using MHBackend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MHBackend.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace MHBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly MyAppDbContext _context;

        private readonly IUserRepository _userRepository;

        public EventController(MyAppDbContext context, IUserRepository userRepository)
        {
            _context = context;
            _userRepository = userRepository;
        }

        // Get: api/Event : Return All events 
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventReadDto>>> GetAllEvents()
        {

            var events = await _context.Events.ToListAsync();

            return events.Select(e => new EventReadDto
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
                ImageUrl = e.ImageUrl,
                CreatedBy = e.CreatedBy,
                CommunityId = e.CommunityId
            }).ToList();
        }

        // Get: api/Event/{publicEventId} : Return spcific event 
        [HttpGet("{publicEventId}")]
        public async Task<ActionResult<EventReadDto>> GetEvent(string publicEventId)
        {
            var e = await _context.Events.FirstOrDefaultAsync(ev => ev.PublicEventId == publicEventId);

            if (e == null)
                return NotFound();

            return new EventReadDto
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
                ImageUrl = e.ImageUrl,
                CreatedBy = e.CreatedBy,
                CommunityId = e.CommunityId
            };
        }


        // POST: api/Events : Create event 
        [HttpPost]
        [Authorize(Policy = "AdminRole")]
        public async Task<ActionResult<Event>> CreateEvent(EventCreateDto dto)
        {
            // Get Firebase UID from token claims
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized("User not authenticated");

            // Get user from Firebase UID
            var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);
            if (user == null)
                return NotFound("User not found");

            var newEvent = new Event
            {
                PublicEventId = Guid.NewGuid().ToString(),
                Title = dto.Title,
                Description = dto.Description,
                Location = dto.Location,
                Capacity = dto.Capacity,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = dto.Status,
                EventType = dto.EventType,
                CreatedBy = user.UserId, 
                CommunityId = dto.CommunityId,
                ImageUrl = dto.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent), new { id = newEvent.EventId }, newEvent);
        }


        // PUT: api/Events/{publicEventId}: Update an event 
        [HttpPut("{publicEventId}")]
        public async Task<IActionResult> UpdateEvent(string publicEventId, EventUpdateDto dto)
        {
            var e = await _context.Events.FirstOrDefaultAsync(ev => ev.PublicEventId == publicEventId);

            if (e == null)
                return NotFound();

            e.Title = dto.Title;
            e.Description = dto.Description;
            e.Location = dto.Location;
            e.Capacity = dto.Capacity;
            e.StartDate = dto.StartDate;
            e.EndDate = dto.EndDate;
            e.Status = dto.Status;
            e.EventType = dto.EventType;
            e.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }


        // DELETE: api/Events/{publicEventId} : Delete an event 
        [HttpDelete("{publicEventId}")]
        public async Task<IActionResult> DeleteEvent(string publicEventId)
        {
            var e = await _context.Events.FirstOrDefaultAsync(ev => ev.PublicEventId == publicEventId);

            if (e == null)
                return NotFound();

            _context.Events.Remove(e);
            await _context.SaveChangesAsync();

            return NoContent();
        }


    }

}
