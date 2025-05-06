using System;

namespace MHBackend.DTOs
{
    public class BookingDto
    {
        public string PublicBookingId { get; set; }
        public DateTime BookingDate { get; set; }
        public string Status { get; set; }
        public string EventTitle { get; set; }
        public string CommunityName { get; set; }
        public string PublicEventId { get; set; }
    }
}