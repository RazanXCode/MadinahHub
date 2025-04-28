using Microsoft.AspNetCore.Identity;

namespace MHBackend.DTOs{
    public class UserResponse{
        public int Id {get; set;}
        public string Username {get; set;}
        public string Address {get; set;}
        public string Role {get; set;}
        public string PhoneNumber {get; set;}
        public DateTime CreatedAt {get; set;}
    }
}