
using QRCoder;
namespace MHBackend.Services
{


    
    public class QRCodeService : IQRCodeService
    {

        
        public string GenerateQRCodeAsync(string code)
        {

           using var qrGenerator = new QRCoder.QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(code, QRCoder.QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new QRCoder.PngByteQRCode(qrCodeData);
            var qrCodeBytes = qrCode.GetGraphic(20);
            return Convert.ToBase64String(qrCodeBytes);
        }

    }
}

