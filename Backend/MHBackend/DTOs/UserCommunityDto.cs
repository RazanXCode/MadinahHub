namespace MHBackend.DTOs
{
    public class UserCommunityDto
    {

        public string PublicCommunityId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int MemberCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime JoinDate { get; set; }

    }
}
