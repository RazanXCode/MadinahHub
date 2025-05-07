using Microsoft.AspNetCore.Identity;
using MHBackend.Models;

namespace MHBackend.DTOs{
    public class UserResponse{
        public int UserId {get; set;}
        public string PublicUserId {get; set;}
        public string UserName {get; set;}
        public string Address {get; set;}
        public string Role {get; set;}
        public string PhoneNumber {get; set;}
        public DateTime CreatedAt {get; set;}
    }
}