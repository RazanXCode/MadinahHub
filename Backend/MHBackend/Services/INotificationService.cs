namespace MHBackend.Services
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(int userId, string content, int? bookingId = null);
        Task CreateBookingNotificationAsync(int userId, int bookingId, string status);
    }
}