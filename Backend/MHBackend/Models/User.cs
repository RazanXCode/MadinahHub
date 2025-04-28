using System.ComponentModel.DataAnnotations;

namespace MHBackend.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public string PublicUserId { get; set; }

        [Required]
        public string FirebaseUid { get; set; }

        [Required]
        public string UserName { get; set; }


        public string? Address { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        [Required]
        public Role Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties 
        public ICollection<Event> EventsCreated { get; set; } = new List<Event>();
        public ICollection<UserCommunity> UserCommunities { get; set; } = new List<UserCommunity>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();


    }

    public enum Role
    {
        User,
        Admin
    }

}