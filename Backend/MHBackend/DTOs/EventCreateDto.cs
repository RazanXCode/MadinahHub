using MHBackend.Models;

namespace MHBackend.DTOs
{
    public class EventCreateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public int? Capacity { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EventStatus Status { get; set; }
        public EventType EventType { get; set; }
        public string? ImageUrl { get; set; }
        public int CreatedBy { get; set; }
        public int CommunityId { get; set; }
    }
}
