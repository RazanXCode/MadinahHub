using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MHBackend.Models
{
    public class DeviceToken
    {
        [Key]
        public int DeviceTokenId { get; set; }

        [Required]
        [StringLength(1000)]
        public string Token { get; set; }

        [Required]
        public string DeviceId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Foreign key to User
        public int UserId { get; set; }

        // PublicUserId to make lookups easier
        [Required]
        [StringLength(100)]
        public string UserPublicId { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public virtual User User { get; set; }
    }
}