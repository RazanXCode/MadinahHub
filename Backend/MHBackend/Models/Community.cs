using System.ComponentModel.DataAnnotations;

namespace MHBackend.Models
{

    public class Community
    {
        [Key]
        public int CommunityId { get; set; }

        [Required]
        public string PublicCommunityId { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Description { get; set; }

        public int MemberCount { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? ImageUrl { get; set; }


        // Navigation properties
        public ICollection<UserCommunity> UserCommunities { get; set; } = new List<UserCommunity>();
        public ICollection<Event> Events { get; set; } = new List<Event>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();



    }
}