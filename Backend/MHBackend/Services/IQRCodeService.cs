namespace MHBackend.Services
{
    public interface IQRCodeService
    {
        string GenerateQRCodeAsync(string code);
    }
}
