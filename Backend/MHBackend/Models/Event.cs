using System.ComponentModel.DataAnnotations;

namespace MHBackend.Models
{
    public class Event
    {
        [Key]
        public int EventId { get; set; }

        [Required]
        public string PublicEventId { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Location { get; set; }

        public int? Capacity { get; set; } // in case of public events there will be no capacity 

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public EventStatus Status { get; set; }

        [Required]
        public EventType EventType { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? ImageUrl { get; set; }

        // FK
        public int CreatedBy { get; set; }
        public int CommunityId { get; set; }

        // Navigation properties
        public User Creator { get; set; }
        public Community Community { get; set; }
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

    }

    public enum EventStatus
    {
        Upcoming,
        Active,
        Finished
    }

    public enum EventType
    {
        Public,
        Private
    }

}