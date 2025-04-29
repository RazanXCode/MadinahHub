using System.ComponentModel.DataAnnotations;

namespace MHBackend.Models
{
    public class Ticket
    {
        [Key]
        public int TicketId { get; set; }

        [Required]
        public string PublicTicketId { get; set; }


        public string QRCode { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        public TicketStatus Status { get; set; }


        // FK
        public int BookingId { get; set; }
        public int EventId { get; set; }


        // Navigation property
        public Booking Booking { get; set; }
        public Event Event { get; set; }
    }

    public enum TicketStatus
    {
        Valid,
        Used,
        Cancelled
    }
}