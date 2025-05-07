namespace MHBackend.DTOs
{
    public class UserTicketDto
    {
        public string PublicTicketId { get; set; }
        public string QRCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public string EventTitle { get; set; }
        public string CommunityName { get; set; }
        public string PublicBookingId { get; set; } // Added This line 

    }
}
