using System.ComponentModel.DataAnnotations;

namespace MHBackend.Models
{
    public class Booking
    {
        [Key]
        public int BookingId { get; set; }

        [Required]
        public string PublicBookingId { get; set; }

        [Required]
        public DateTime BookingDate { get; set; }

        [Required]
        public BookingStatus Status { get; set; }

        // FK
        public int UserId { get; set; }

        // Navigation properties 
        public User User { get; set; }
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public Ticket Ticket { get; set; }
    }

    public enum BookingStatus
    {
        Confirmed,
        Cancelled
    }

}