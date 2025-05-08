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
    public class CommunityControllerTests
    {
        private readonly CommunityController _controller;
        private readonly MyAppDbContext _context;
        private readonly Mock<IUserRepository> _userRepoMock;

        public CommunityControllerTests()
        {
            // Set up an in-memory database
            var options = new DbContextOptionsBuilder<MyAppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new MyAppDbContext(options);
            _userRepoMock = new Mock<IUserRepository>();
            _controller = new CommunityController(_context, _userRepoMock.Object);
        }

        [Fact]
        public async Task CreateCommunity_ReturnsCreatedCommunity()
        {
            // Arrange
            var createCommunityDto = new CreateCommunityDto
            {
                Name = "Test Community",
                Description = "A community for testing",
                ImageUrl = "http://example.com/image.jpg"
            };

            // Act
            var result = await _controller.CreateCommunity(createCommunityDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            var communityDto = Assert.IsType<CommunityDto>(createdAtActionResult.Value);
            Assert.Equal(createCommunityDto.Name, communityDto.Name);
            Assert.Equal(createCommunityDto.Description, communityDto.Description);
        }

        [Fact]
        public async Task GetCommunity_ReturnsCommunity_WhenCommunityExists()
        {
            // Arrange
            var community = new Community
            {
                PublicCommunityId = "test-id",
                Name = "Test Community",
                Description = "Test Description",
                MemberCount = 10,
                CreatedAt = DateTime.UtcNow,
                ImageUrl = "http://example.com/image.jpg"
            };

            _context.Communities.Add(community);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetCommunity("test-id");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedCommunity = Assert.IsType<CommunityDto>(okResult.Value);
            Assert.Equal(community.PublicCommunityId, returnedCommunity.PublicCommunityId);
            Assert.Equal(community.Name, returnedCommunity.Name);
        }


        [Fact]
        public async Task UpdateCommunity_ReturnsOk_WhenCommunityExists()
        {
            // Arrange
            var community = new Community { PublicCommunityId = "test-id", Name = "Old Name", Description = "Old Description" };
            _context.Communities.Add(community);
            await _context.SaveChangesAsync();

            var updateDto = new CreateCommunityDto
            {
                Name = "Updated Name",
                Description = "Updated Description",
                ImageUrl = "http://example.com/updated.jpg"
            };

            // Act
            var result = await _controller.UpdateCommunity("test-id", updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Community updated successfully", okResult.Value);

            var updatedCommunity = await _context.Communities.FindAsync(community.CommunityId);
            Assert.Equal(updateDto.Name, updatedCommunity.Name);
        }


        [Fact]
        public async Task DeleteCommunity_ReturnsOk_WhenCommunityExists()
        {
            // Arrange
            var community = new Community
            {
                PublicCommunityId = "test-id",
                Name = "Test Community",
                Description = "Test Description" 
            };
            _context.Communities.Add(community);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.DeleteCommunity("test-id");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("community deleted successfully", okResult.Value);

            var deletedCommunity = await _context.Communities.FindAsync(community.CommunityId);
            Assert.Null(deletedCommunity);
        }


        [Fact]
        public async Task JoinCommunity_ReturnsOk_WhenUserJoinsCommunity()
        {
            // Arrange
            var user = new User { UserId = 1, FirebaseUid = "firebase-id" };
            _userRepoMock.Setup(repo => repo.GetByFirebaseUidAsync("firebase-id")).ReturnsAsync(user);

            var community = new Community
            {
                PublicCommunityId = "test-id",
                Name = "Test Community",
                Description = "Test Description",
                MemberCount = 10
            };
            _context.Communities.Add(community);
            await _context.SaveChangesAsync();

            var userClaims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, "firebase-id")
    };
            var identity = new ClaimsIdentity(userClaims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var result = await _controller.JoinCommunity("test-id");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var responseType = okResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.NotNull(messageProperty); // Verify the property exists
            var responseMessage = messageProperty.GetValue(okResult.Value) as string;
            Assert.Equal("Joined community", responseMessage);

            // Verify database changes
            var userCommunity = await _context.UserCommunities
                .FirstOrDefaultAsync(uc => uc.UserId == user.UserId && uc.CommunityId == community.CommunityId);
            Assert.NotNull(userCommunity);

            var updatedCommunity = await _context.Communities.FindAsync(community.CommunityId);
            Assert.Equal(11, updatedCommunity.MemberCount);
        }



        [Fact]
        public async Task LeaveCommunity_ReturnsOk_WhenUserLeavesCommunity()
        {
            // Arrange
            var user = new User { UserId = 1, FirebaseUid = "firebase-id" };
            _userRepoMock.Setup(repo => repo.GetByFirebaseUidAsync("firebase-id")).ReturnsAsync(user);

            var community = new Community
            {
                PublicCommunityId = "test-id",
                Name = "Test Community",
                Description = "Test Description", 
                MemberCount = 10
            };

            _context.Communities.Add(community);
            await _context.SaveChangesAsync();

            var userCommunity = new UserCommunity
            {
                UserId = user.UserId,
                CommunityId = community.CommunityId,
                JoinDate = DateTime.UtcNow 
            };

            _context.UserCommunities.Add(userCommunity);
            await _context.SaveChangesAsync();

          
            var userClaims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, "firebase-id")
    };
            var identity = new ClaimsIdentity(userClaims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var result = await _controller.LeaveCommunity("test-id");

            // Assert :  message , user no longer in communty , member count updated 
            var okResult = Assert.IsType<OkObjectResult>(result);
            var responseType = okResult.Value.GetType();
            var messageProperty = responseType.GetProperty("message");
            Assert.NotNull(messageProperty);
            var responseMessage = messageProperty.GetValue(okResult.Value) as string;
            Assert.Equal("left community", responseMessage);

            // Verify user was removed from community
            var removedUserCommunity = await _context.UserCommunities
                .FirstOrDefaultAsync(uc => uc.UserId == user.UserId && uc.CommunityId == community.CommunityId);
            Assert.Null(removedUserCommunity);

            // Verify member count was decremented
            var updatedCommunity = await _context.Communities.FindAsync(community.CommunityId);
            Assert.Equal(9, updatedCommunity.MemberCount);
        }



        [Fact]
        public async Task GetCommunityEvents_ReturnsCommunityEvents_WhenCommunityExists()
        {
            // Arrange
            var community = new Community
            {
                PublicCommunityId = "test-id",
                Name = "Test Community",
                Description = "Test Description" 
            };
            _context.Communities.Add(community);
            await _context.SaveChangesAsync();
            var event1 = new Event
            {
                PublicEventId = "event1",
                Title = "Event 1",
                Description = "First event description",   
                Location = "Test Location A",            
                CommunityId = community.CommunityId
            };

            var event2 = new Event
            {
                PublicEventId = "event2",
                Title = "Event 2",
                Description = "Second event description", 
                Location = "Test Location B",             
                CommunityId = community.CommunityId
            };
            _context.Events.AddRange(event1, event2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetCommunityEvents("test-id");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var events = Assert.IsType<List<CommunityEventDto>>(okResult.Value);
            Assert.Equal(2, events.Count);
            Assert.Contains(events, e => e.Title == "Event 1");
            Assert.Contains(events, e => e.Title == "Event 2");
        }


    }
}
