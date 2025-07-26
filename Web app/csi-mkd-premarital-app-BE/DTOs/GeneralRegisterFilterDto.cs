namespace csi_mkd_premarital_app_BE.DTOs
{
    public class GeneralRegisterFilterDto
    {
        public string? Search { get; set; }
        public bool? UnapprovedOnly { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

    }
}