namespace MHBackend.Models{
    public class User{
        public int Id {get; set;}
        public string FirebaseUid {get; set;}
        public string UserIdPublic {get; set;}
        public string Username {get; set;}
        public string Address {get; set;}
        public UserRole Role {get; set;}
        public string PhoneNumber {get; set;}
        public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
    }
        public enum UserRole
    {
        Visitor,
        Admin
    }
}