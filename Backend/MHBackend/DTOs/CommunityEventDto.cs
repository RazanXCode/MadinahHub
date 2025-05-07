using MHBackend.Models;

namespace MHBackend.DTOs
{
    public class CommunityEventDto
    {
        public string PublicEventId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public string Location { get; set; }
        public string Status { get; set; }
        public string? ImageUrl { get; set; }
        public int? Capacity { get; set; }
        public string EventType { get; set; }



    }
}
