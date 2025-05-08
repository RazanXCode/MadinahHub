namespace MHBackend.Services
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(int userId, string content, int? bookingId = null);
        Task CreateCommunityNotificationAsync(int userId, string communityName, string action);
        Task CreateBookingNotificationAsync(int userId, int bookingId, string status);
    }
}