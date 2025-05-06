using MHBackend.Data;
using MHBackend.DTOs;
using MHBackend.Models;
using MHBackend.Repositories;
using MHBackend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Sockets;
using System.Security.Claims;

namespace MHBackend.Controllers
{
    [Route("Booking")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly MyAppDbContext _db;
        private readonly IQRCodeService _qRCodeService;
        private readonly IUserRepository _userRepository;
        private readonly ISmsService _smsService;

        public BookingsController(MyAppDbContext db, IQRCodeService qRCodeService,IUserRepository userRepository, ISmsService smsService)
        {
            _db = db;
            _qRCodeService = qRCodeService;
            _userRepository = userRepository;
            _smsService = smsService;
        }

        //POST: Booking/BookEvent/{PublicEventId}
        [HttpPost("BookEvent/{PublicEventId}")]
        public async Task<IActionResult> BookEvent( string PublicEventId )
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);

            var eventToBook = _db.Events
                .Include(e => e.Tickets)
                .FirstOrDefault(e => e.PublicEventId == PublicEventId);

            if (eventToBook == null)
                return NotFound("Event not found");

            if (eventToBook.Status != EventStatus.Active) // user can only book active events
                return BadRequest("Event is not available for booking"); 

            // Check capacity 
            if (eventToBook.EventType != EventType.Public){
                if (eventToBook.Capacity.HasValue &&
                    eventToBook.Tickets.Count(t => t.Status == TicketStatus.Valid) >= eventToBook.Capacity.Value)
                    return BadRequest("Event is Fully Booked");
            }
            // Check if user already has a booking
            var userBooking = await _db.Bookings
                .Include(b => b.Ticket)
                .FirstOrDefaultAsync(b => b.UserId == user.UserId &&
                                         b.Ticket.EventId == eventToBook.EventId &&
                                         b.Status != BookingStatus.Cancelled);
            if (userBooking != null)
                return BadRequest("You already have a booking for this event");

            // Create the booking
            var newBooking = new Booking
            {
                PublicBookingId = Guid.NewGuid().ToString(),
                UserId = user.UserId,
                Status = BookingStatus.Confirmed,
                BookingDate = DateTime.UtcNow
            };

            // Create the ticket
            var newTicket = new Ticket
            {
                PublicTicketId = Guid.NewGuid().ToString(),
                EventId = eventToBook.EventId,
                Status = TicketStatus.Valid,
                Booking = newBooking,
                QRCode =  _qRCodeService.GenerateQRCodeAsync($"{newBooking.PublicBookingId}{eventToBook.Title}{eventToBook.Location}"),
            };
            if (eventToBook.EventType != EventType.Public && eventToBook.Capacity.HasValue)
            {
                eventToBook.Capacity--;
            }
            //  Save to database
            await _db.Tickets.AddAsync(newTicket);
            await _db.SaveChangesAsync();

            // Send SMS notification to the user
            if (!string.IsNullOrEmpty(user.PhoneNumber))
            {
                var message = $"Dear {user.UserName}, your booking for \"{eventToBook.Title}\" is confirmed. Date: {eventToBook.StartDate:g}. Location: {eventToBook.Location}";
                await _smsService.SendAsync(user.PhoneNumber, message);
            }
            return Ok(new { message = "Booking Confirmed" });


        }

        // POST: Booking/CancelBooking/{publicBookingId}
        [HttpPost("CancelBooking/{publicBookingId}")]
        public async Task<IActionResult> CancelBooking( string publicBookingId)
        {
            // Grt current user from token
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized("User not authenticated");

            var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);


            var booking = await _db.Bookings
            .Include(b => b.Ticket)
            .ThenInclude(t => t.Event)  // Load event to check capacity
            .FirstOrDefaultAsync(b =>
             b.PublicBookingId == publicBookingId &&
             b.UserId == user.UserId 
             );
            if (booking == null)
                return NotFound("Booking not found or you dont have permission");

            if (booking.Status == BookingStatus.Cancelled)
                return BadRequest("Booking already cancelled");

            booking.Status = BookingStatus.Cancelled;
            booking.Ticket.Status = TicketStatus.Cancelled;
            // Update event capacity
            if (booking.Ticket.Event.Capacity.HasValue)
            {
                booking.Ticket.Event.Capacity++;
            }
            await _db.SaveChangesAsync();

            // Send SMS notification about booking cancellation
            if (!string.IsNullOrEmpty(user.PhoneNumber))
            {
                var message = $"Dear {user.UserName}, your booking for \"{booking.Ticket.Event.Title}\" has been cancelled successfully.";
                await _smsService.SendAsync(user.PhoneNumber, message);
            }
            return Ok(new { message = "Booking Cancelled" });



        }

//Get: Booking/GetUserBookings
[HttpGet("GetUserBookings")]
public async Task<IActionResult> GetUserBookings()
{
    // Get current user from token
    var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(firebaseUid))
        return Unauthorized("User not authenticated");

    var user = await _userRepository.GetByFirebaseUidAsync(firebaseUid);
    if (user == null)
        return NotFound("User not found");

    // Get bookings for this user with event details
    var bookings = await _db.Bookings
        .Include(b => b.Ticket)
            .ThenInclude(t => t.Event)
                .ThenInclude(e => e.Community)
        .Where(b => b.UserId == user.UserId)
        .Select(b => new BookingDto
        {
            PublicBookingId = b.PublicBookingId,
            BookingDate = b.BookingDate,
            Status = b.Status.ToString(),
            EventTitle = b.Ticket.Event.Title,
            CommunityName = b.Ticket.Event.Community.Name ?? "Unknown Community",
            PublicEventId = b.Ticket.Event.PublicEventId
        })
        .ToListAsync();

    if (!bookings.Any())
        return Ok(new List<BookingDto>()); // Return empty list instead of 404

    return Ok(bookings);
}
}
}

