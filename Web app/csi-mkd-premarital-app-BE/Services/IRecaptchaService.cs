namespace csi_mkd_premarital_app_BE.Services;

public interface IRecaptchaService
{
    Task<bool> VerifyTokenAsync(string token);
}
