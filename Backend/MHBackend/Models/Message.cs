using System.ComponentModel.DataAnnotations;

namespace MHBackend.Models
{
    public class Message
    {

        [Key]
        public int MessageId { get; set; }

        [Required]
        public string PublicMessageId { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        public MessageStatus Status { get; set; }

        // FK
        public int UserId { get; set; }
        public int CommunityId { get; set; }

        // Navigation properties
        public User User { get; set; }
        public Community Community { get; set; }

    }

    public enum MessageStatus
    {
        Delivered,
        Deleted
    }
}