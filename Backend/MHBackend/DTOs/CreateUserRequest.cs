namespace MHBackend.DTOs{
    public class CreateUserRequest{
        public string FirebaseUid {get; set;}
        public string Username {get; set;}
        public string Address {get; set;}
        public string PhoneNumber {get; set;}
    }
}