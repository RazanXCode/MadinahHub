using System.ComponentModel.DataAnnotations;

namespace MHBackend.Models
{
    public class UserCommunity
    {
        [Required]
        public DateTime JoinDate { get; set; }

        // FK
        public int UserId { get; set; }
        public int CommunityId { get; set; }


        // Navigation properties
        public User User { get; set; }
        public Community Community { get; set; }
    }

}