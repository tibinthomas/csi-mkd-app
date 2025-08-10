using System.Security.Cryptography;
using System.Text;

namespace csi_mkd_premarital_app_BE.Utilities;

public static class ETagHelper
{
    public static string GenerateETag(string input)
    {
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = SHA256.HashData(bytes);
        var base64 = Convert.ToBase64String(hash);
        return $"\"{base64}\"";
    }
}


