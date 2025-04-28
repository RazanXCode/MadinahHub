using System.ComponentModel.DataAnnotations;

namespace MHBackend.Models
{

    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required]
        public string PublicNotificationId { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }  = DateTime.UtcNow; 


        // FK
        public int UserId { get; set; }
        public int BookingId { get; set; }

        // Navigation properties 
        public User User { get; set; }
        public Booking Booking { get; set; }

    }





}