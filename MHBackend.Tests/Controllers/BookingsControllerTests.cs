using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using MHBackend.Controllers;
using MHBackend.Data;
using MHBackend.DTOs;
using MHBackend.Models;
using MHBackend.Repositories;
using MHBackend.Services;


namespace MHBackend.Tests.Controllers
{
    public class BookingsControllerTests
    {
        private readonly MyAppDbContext _context;
        private readonly Mock<IQRCodeService> _qrCodeServiceMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly BookingsController _controller;

        public BookingsControllerTests()
        {
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new MyAppDbContext(options);

            _qrCodeServiceMock = new Mock<IQRCodeService>();
            _qrCodeServiceMock.Setup(q => q.GenerateQRCodeAsync(It.IsAny<string>())).Returns("dummy-qr");

            _userRepoMock = new Mock<IUserRepository>();

            _controller = new BookingsController(_context, _qrCodeServiceMock.Object, _userRepoMock.Object);

            var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, "firebase-uid-1") };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };
        }

        [Fact]
        public async Task BookEvent_ReturnsOk_WhenBookingSuccessful()
        {
            //Arrange
            var user = new User { UserId = 1, FirebaseUid = "firebase-uid-1" };
            _userRepoMock.Setup(r => r.GetByFirebaseUidAsync("firebase-uid-1")).ReturnsAsync(user);

            var ev = new Event
            {
                EventId = 1,
                PublicEventId = "event-1",
                Title = "Test Event",
                Location = "Test Location",
                Description = "Test",
                EventType = EventType.Private,
                Capacity = 10,
                Status = EventStatus.Active,
                Tickets = new List<Ticket>()
            };
            await _context.Events.AddAsync(ev);
            await _context.SaveChangesAsync();

            //Act
            var result = await _controller.BookEvent("event-1");

            //Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<Dictionary<string, object>>(okResult.Value);
            Assert.Equal("Booking Confirmed", response["message"]);
        }


        [Fact]
        public async Task CancelBooking_ReturnsOk_WhenBookingIsCancelled()
        {
            //Arrange
            var user = new User { UserId = 2, FirebaseUid = "firebase-uid-1" };
            _userRepoMock.Setup(r => r.GetByFirebaseUidAsync("firebase-uid-1")).ReturnsAsync(user);

            var ev = new Event
            {
                EventId = 2,
                PublicEventId = "event-2",
                Title = "Event 2",
                Location = "Loc 2",
                Description = "Desc",
                EventType = EventType.Public,
                Capacity = 20,
                Status = EventStatus.Active
            };

            var booking = new Booking
            {
                BookingId = 1,
                PublicBookingId = "booking-1",
                UserId = user.UserId,
                Status = BookingStatus.Confirmed,
                BookingDate = DateTime.UtcNow
            };

            var ticket = new Ticket
            {
                TicketId = 1,
                PublicTicketId = "ticket-1",
                Event = ev,
                EventId = ev.EventId,
                Booking = booking,
                BookingId = booking.BookingId,
                Status = TicketStatus.Valid,
                QRCode = "dummy-qr"
            };
            booking.Ticket = ticket;

            await _context.Events.AddAsync(ev);
            await _context.Bookings.AddAsync(booking);
            await _context.Tickets.AddAsync(ticket);
            await _context.SaveChangesAsync();


            //Act
            var result = await _controller.CancelBooking("booking-1");

            //Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<Dictionary<string, object>>(okResult.Value);
            Assert.Equal("Booking Cancelled", response["message"]);
        }


        [Fact]
        public async Task GetUserBookings_ReturnsList_WhenBookingsExist()
        {
            //Arrange
            var user = new User { UserId = 3, FirebaseUid = "firebase-uid-1" };
            _userRepoMock.Setup(r => r.GetByFirebaseUidAsync("firebase-uid-1")).ReturnsAsync(user);

            var community = new Community
            {
                CommunityId = 1,
                PublicCommunityId = "comm-1",
                Name = "Community",
                Description = "Desc"
            };

            var ev = new Event
            {
                EventId = 3,
                PublicEventId = "event-3",
                Title = "Event 3",
                Location = "Loc 3",
                Description = "Desc",
                EventType = EventType.Public,
                Capacity = 50,
                Community = community,
                CommunityId = community.CommunityId
            };

            var booking = new Booking
            {
                BookingId = 2,
                PublicBookingId = "booking-2",
                UserId = user.UserId,
                Status = BookingStatus.Confirmed,
                BookingDate = DateTime.UtcNow
            };

            var ticket = new Ticket
            {
                TicketId = 2,
                PublicTicketId = "ticket-2",
                Event = ev,
                EventId = ev.EventId,
                Booking = booking,
                BookingId = booking.BookingId,
                Status = TicketStatus.Valid,
                QRCode = "dummy-qr"
            };
            booking.Ticket = ticket;

            await _context.Communities.AddAsync(community);
            await _context.Events.AddAsync(ev);
            await _context.Bookings.AddAsync(booking);
            await _context.Tickets.AddAsync(ticket);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetUserBookings();

            //Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var bookings = Assert.IsType<List<BookingDto>>(okResult.Value);
            Assert.Single(bookings);
            Assert.Equal("Event 3", bookings[0].EventTitle);
        }
    }

}
