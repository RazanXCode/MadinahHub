namespace MHBackend.DTOs
{
    public class MessageDto
    {
        public string MessageId { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
        public string UserName { get; set; }
        public string UserPublicId { get; set; }
    }

    public class CreateMessageDto
    {
        public string Content { get; set; }
    }
}