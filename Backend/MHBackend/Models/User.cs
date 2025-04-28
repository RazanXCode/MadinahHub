namespace MHBackend.Models{
    public class User{
        public int Id {get; set;}
        public string FirebaseUid {get; set;}
        public string Username {get; set;}
        public string Address {get; set;}
        public string Role {get; set;}
        public string PhoneNumber {get; set;}
        public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
    }
}