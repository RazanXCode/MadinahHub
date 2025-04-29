using Microsoft.AspNetCore.Identity;
using MHBackend.Models;

namespace MHBackend.DTOs{
    public class UserResponse{
        public int Id {get; set;}
        public string UserIdPublic {get; set;}
        public string Username {get; set;}
        public string Address {get; set;}
        public UserRole Role {get; set;}
        public string PhoneNumber {get; set;}
        public DateTime CreatedAt {get; set;}
    }
}