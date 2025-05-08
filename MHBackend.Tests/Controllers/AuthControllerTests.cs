using Xunit;
using Moq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using MHBackend.Controllers;
using MHBackend.Repositories;
using MHBackend.Models;
using MHBackend.DTOs;

namespace MHBackend.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _controller = new AuthController(_userRepoMock.Object);
        }

        [Fact]
        public async Task Register_ReturnsCreated_WhenUserIsRegistered()
        {
            // Arrange
            var firebaseUid = "firebase-uid-123";
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, firebaseUid)
            }, "mock"));

            var controllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = userClaims }
            };

            var createUserRequest = new CreateUserRequest
            {
                FirebaseUid = firebaseUid,
                Username = "testuser",
                Address = "123 Street",
                PhoneNumber = "1234567890"
            };
            _userRepoMock.Setup(r => r.CreateUserAsync(It.IsAny<User>()))
                         .ReturnsAsync((User u) => u);


            _controller.ControllerContext = controllerContext;

            // Act
            var result = await _controller.Register(createUserRequest);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var response = Assert.IsType<UserResponse>(createdResult.Value);
            Assert.Equal("testuser", response.UserName);
            Assert.Equal("123 Street", response.Address);
            Assert.Equal("1234567890", response.PhoneNumber);
            Assert.Equal("User", response.Role);
            Assert.False(string.IsNullOrEmpty(response.PublicUserId));
        }



        [Fact]
        public async Task Login_ReturnsOk_WhenUserIsFound()
        {
            // Arrange
            var firebaseUid = "firebase-uid-123";
            var userClaims = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, firebaseUid)
            }, "mock"));

            var controllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = userClaims }
            };

            var user = new User
            {
                UserId = 1,
                FirebaseUid = firebaseUid,
                UserName = "testuser",
                Address = "123 Street",
                PhoneNumber = "1234567890",
                Role = Role.User,
                PublicUserId = "usr_123",
                CreatedAt = System.DateTime.UtcNow
            };

            _userRepoMock.Setup(r => r.GetByFirebaseUidAsync(firebaseUid))
                         .ReturnsAsync(user);

            _controller.ControllerContext = controllerContext;

            // Act
            var result = await _controller.Login();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<UserResponse>(okResult.Value);
            Assert.Equal("testuser", response.UserName);
            Assert.Equal("123 Street", response.Address);
            Assert.Equal("1234567890", response.PhoneNumber);
            Assert.Equal("User", response.Role);
            Assert.Equal("usr_123", response.PublicUserId);
        }
    }
}
