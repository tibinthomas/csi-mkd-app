using Microsoft.AspNetCore.Mvc;

public class RegistrationFilterDto
{
    [FromQuery(Name = "search")]
    public string? Search { get; set; }

    [FromQuery(Name = "unapprovedOnly")]
    public bool? UnapprovedOnly { get; set; }

    [FromQuery(Name = "activeSessionOnly")]
    public bool? ActiveSessionOnly { get; set; }

    [FromQuery(Name = "sessionYear")]
    public int? SessionYear { get; set; }

    [FromQuery(Name = "sessionName")]
    public string? SessionName { get; set; }

    [FromQuery(Name = "page")]
    public int Page { get; set; } = 1;

    [FromQuery(Name = "pageSize")]
    public int PageSize { get; set; } = 10;
}
