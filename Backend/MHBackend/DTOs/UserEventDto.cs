using MHBackend.Models;

namespace MHBackend.DTOs
{
    public class UserEventDto
    {
        public string PublicEventId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public int? Capacity { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public string EventType { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? ImageUrl { get; set; }
        public string CommunityName { get; set; } 

    }
}
