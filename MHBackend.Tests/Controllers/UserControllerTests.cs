using MHBackend.Controllers;
using MHBackend.Data;
using MHBackend.DTOs;
using MHBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace MHBackend.Tests.Controllers
{
    public class UserControllerTests
    {
        private readonly MyAppDbContext _context;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _controller = new UserController(_context);
        }
        [Fact]
        public async Task GetAllUsers_ReturnsAllUsers()
        {
            // Arrange
            _context.Users.AddRange(
                new User
                {
                    PublicUserId = "u1",
                    FirebaseUid = "firebase1", 

                    UserName = "Alice",
                    Address = "123 Main St",
                    PhoneNumber = "1234567890",
                    Role = Role.User,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    PublicUserId = "u2",
                    FirebaseUid = "firebase2", 
                    UserName = "Bob",
                    Address = "456 Elm St",
                    PhoneNumber = "0987654321",
                    Role = Role.Admin,
                    CreatedAt = DateTime.UtcNow
                }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAllUsers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var users = Assert.IsAssignableFrom<IEnumerable<UserDto>>(okResult.Value);

            Assert.Equal(2, users.Count());
            Assert.Contains(users, u => u.UserName == "Alice");
            Assert.Contains(users, u => u.UserName == "Bob");
        }

        [Fact]
        public async Task GetUserCommunities_ReturnsUserCommunities()
        {
            // Arrange
            var user = new User
            {
                FirebaseUid = "firebase2",
                PublicUserId = "user2",
                UserName = "Bob",
                CreatedAt = DateTime.UtcNow,
                Role = Role.User,
                PhoneNumber = "1234567890",
                UserCommunities = new List<UserCommunity>()
            };

            var community = new Community
            {
                PublicCommunityId = "com1",
                Name = "Tech Group",
                Description = "Tech stuff",
                MemberCount = 1,
                CreatedAt = DateTime.UtcNow,
                ImageUrl = "img.jpg"
            };

            var userCommunity = new UserCommunity
            {
                Community = community,
                User = user,
                JoinDate = DateTime.UtcNow
            };

            user.UserCommunities.Add(userCommunity);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetUserCommunities("user2");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var communities = Assert.IsAssignableFrom<IEnumerable<UserCommunityDto>>(okResult.Value);
            Assert.Single(communities);
        }

        [Fact]
        public async Task GetUserBookedEvents_ReturnsEvents()
        {
            // Arrange
            var user = new User
            {
                FirebaseUid = "firebase3",
                PublicUserId = "user3",
                UserName = "Eve",
                Role = Role.User,
                PhoneNumber = "1234567890",
                CreatedAt = DateTime.UtcNow,
                Bookings = new List<Booking>()
            };

            var community = new Community
            {
                Name = "Group A",
                PublicCommunityId = "group-a",
                CreatedAt = DateTime.UtcNow,
                Description = "Tech events and discussions"  
            };

            var event1 = new Event
            {
                PublicEventId = "event1",
                Title = "Event A",
                Description = "Desc",
                Community = community,
                CreatedAt = DateTime.UtcNow,
                Status = EventStatus.Upcoming,
                EventType = EventType.Private,
                Location = "Event Location"
            };

            var ticket = new Ticket
            {
                PublicTicketId = "ticket1", 
                QRCode = "QRCode123",       
                Event = event1
            };

            var booking = new Booking
            {
                PublicBookingId = "booking1",
                User = user,
                Ticket = ticket
            };

            user.Bookings.Add(booking);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetUserBookedEvents("user3");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var events = Assert.IsAssignableFrom<IEnumerable<UserEventDto>>(okResult.Value);
            Assert.Single(events);
            Assert.Equal("Event A", events.First().Title);
        }


        [Fact]
        public async Task GetUserTickets_ReturnsTickets()
        {
            // Arrange
            var user = new User
            {
                FirebaseUid = "firebase4",
                PublicUserId = "user4",
                Role = Role.User,
                CreatedAt = DateTime.UtcNow,
                PhoneNumber = "1234567890",  
                UserName = "JohnDoe"        
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var community = new Community
            {
                Name = "Com A",
                PublicCommunityId = "com-a",
                CreatedAt = DateTime.UtcNow,
                Description = "Community description"  
            };

            var @event = new Event
            {
                Title = "Event 1",
                Community = community,
                CreatedAt = DateTime.UtcNow,
                Description = "This is a sample event",
                Location = "Event Location",
                PublicEventId = "event123"
            };

            var booking = new Booking { UserId = user.UserId, PublicBookingId = "book123" };

            var ticket = new Ticket
            {
                PublicTicketId = "ticket1",
                Booking = booking,
                Event = @event,
                Status = TicketStatus.Valid,
                QRCode = "qr123",
                CreatedAt = DateTime.UtcNow
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetUserTickets("user4");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var tickets = Assert.IsAssignableFrom<IEnumerable<UserTicketDto>>(okResult.Value);
            Assert.Single(tickets);
            Assert.Equal("ticket1", tickets.First().PublicTicketId);
        }




    }
}
