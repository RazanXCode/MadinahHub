namespace MHBackend.Models{
    public class User{
        public int UserId {get; set;}
        public string FirebaseUid {get; set;}
        public string PublicUserId {get; set;}
        public string UserName {get; set;}
        public string? Address {get; set;}
        public Role Role {get; set;}
        public string PhoneNumber {get; set;}
        public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
    }
        public enum Role
    {
        User,
        Admin
    }
}