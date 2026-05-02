using Microsoft.AspNetCore.Mvc;

namespace csi_mkd_premarital_app_BE.DTOs
{
    public class ConfirmationRegisterFilterDto
    {
        [FromQuery(Name = "search")]
        public string? Search { get; set; }

        [FromQuery(Name = "page")]
        public int Page { get; set; } = 1;

        [FromQuery(Name = "pageSize")]
        public int PageSize { get; set; } = 10;
    }
}