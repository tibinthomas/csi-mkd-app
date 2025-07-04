namespace csi_mkd_premarital_app_BE.DTOs
{
    public class UpdatePasswordDto
    {
        public string CurrentPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
        public string ConfirmPassword { get; set; } = "";
    }
}