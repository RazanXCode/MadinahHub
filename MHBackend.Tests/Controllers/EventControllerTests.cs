using MHBackend.Controllers;
using MHBackend.Data;
using MHBackend.DTOs;
using MHBackend.Models;
using MHBackend.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;
using Xunit;

namespace MHBackend.Tests.Controllers
{
    public class EventControllerTests
    {
        private readonly MyAppDbContext _context;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly EventController _controller;

        public EventControllerTests()
        {
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _userRepoMock = new Mock<IUserRepository>();
            _controller = new EventController(_context, _userRepoMock.Object);
        }
        [Fact]
        public async Task GetAllEvents_ReturnsAllEvents()
        {
            // Arrange
            var testEvent = new Event
            {
                PublicEventId = "1",
                Title = "Test",
                Description = "Test Event",
                Location = "Test Location", 
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(1),
                Status = EventStatus.Upcoming,
                EventType = EventType.Public,
                CreatedBy = 1,
                CommunityId = 1,
                CreatedAt = DateTime.UtcNow
            };

            _context.Events.Add(testEvent);
            _context.SaveChanges();

            // Act
            var result = await _controller.GetAllEvents();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<EventReadDto>>>(result);
            var returnValue = Assert.IsType<List<EventReadDto>>(actionResult.Value);
            Assert.Single(returnValue);
            Assert.Equal("Test", returnValue[0].Title);
        }


        [Fact]
        public async Task GetEvent_ValidId_ReturnsEvent()
        {
            // Arrange
            var testId = "abc123";
            _context.Events.Add(new Event
            {
                PublicEventId = testId,
                Title = "Sample Event",
                Description = "Test Description",
                Location = "Test Location",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(1),
                Status = EventStatus.Upcoming,
                EventType = EventType.Public,
                CommunityId = 1,
                CreatedBy = 0
            });

            _context.SaveChanges();

            // Act
            var result = await _controller.GetEvent(testId);

            // Assert
            var okResult = Assert.IsType<ActionResult<EventReadDto>>(result);
            Assert.Equal(testId, okResult.Value.PublicEventId);
        }


        [Fact]
        public async Task CreateEvent_ReturnsCreatedEvent_WhenValidInputProvided()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: "CreateEvent_NoAuthTestDb")
                .Options;

            using var context = new MyAppDbContext(options);

            var mockUserRepo = new Mock<IUserRepository>();s
            var controller = new EventController(context, mockUserRepo.Object);

            var dto = new EventCreateDto
            {
                Title = "Test Event",
                Description = "Test description",
                Location = "Medinah",
                Capacity = 100,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(1),
                Status = EventStatus.Upcoming,
                EventType = EventType.Public,
                ImageUrl = "http://test.com/image.png",
                CommunityId = 1,
                CreatedBy = 0 
            };

            // Act
            var result = await controller.CreateEvent(dto);

            // Assert
            var createdAt = Assert.IsType<CreatedAtActionResult>(result.Result);
            var createdEvent = Assert.IsType<Event>(createdAt.Value);
            Assert.Equal(dto.Title, createdEvent.Title);
            Assert.Equal(dto.Description, createdEvent.Description);
        }


        [Fact]
        public async Task UpdateEvent_ValidId_UpdatesEvent()
        {
            // Arrange
            var publicId = "xyz789";
            _context.Events.Add(new Event
            {
                PublicEventId = publicId,
                Title = "Old Title",
                Description = "Old Description",
                Location = "Old Location",
                Capacity = 100,
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(2),
                Status = EventStatus.Upcoming,
                EventType = EventType.Public,
                ImageUrl = "old.jpg",
                CommunityId = 1,
                CreatedBy = 1
            });
            _context.SaveChanges();

            var dto = new EventUpdateDto
            {
                Title = "Updated",
                Description = "Updated",
                Location = "Updated",
                Capacity = 50,
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddHours(1),
                Status = EventStatus.Upcoming,
                EventType = EventType.Public,
                ImageUrl = "updated.jpg"
            };

            //Act
            var result = await _controller.UpdateEvent(publicId, dto);

            //Assert
            Assert.IsType<NoContentResult>(result);
            var updated = await _context.Events.FirstOrDefaultAsync(e => e.PublicEventId == publicId);
            Assert.Equal("Updated", updated.Title);
        }


        [Fact]
        public async Task DeleteEvent_ValidId_DeletesEvent()
        {

            //Arrange 
            var publicId = "del123";
            _context.Events.Add(new Event
            {
                PublicEventId = publicId,
                Title = "To Delete",
                Description = "This event will be deleted",
                Location = "Test Location",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(1),
                Status = EventStatus.Upcoming,
                EventType = EventType.Public,
                CommunityId = 1,
                CreatedBy = 0
            });

            _context.SaveChanges();

            //Act
            var result = await _controller.DeleteEvent(publicId);

            //Assert
            Assert.IsType<NoContentResult>(result);
            var deleted = await _context.Events.FirstOrDefaultAsync(e => e.PublicEventId == publicId);
            Assert.Null(deleted);
        }

    }
}
