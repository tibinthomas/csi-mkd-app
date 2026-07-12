namespace csi_mkd_premarital_app_BE.DTOs;

/// <summary>Payload for submitting feedback about the app itself.</summary>
public class AppFeedbackDto
{
    /// <summary>Star rating, 1–5.</summary>
    public int Rating { get; set; }

    public string? LikedMost { get; set; }

    public string? Improvements { get; set; }

    public string? Page { get; set; }

    public string? Locale { get; set; }
}

/// <summary>App feedback entry as returned to admins.</summary>
public class AppFeedbackResponseDto
{
    public Guid Id { get; set; }
    public int Rating { get; set; }
    public string? LikedMost { get; set; }
    public string? Improvements { get; set; }
    public string? Page { get; set; }
    public string? Locale { get; set; }
    public DateTime CreatedAt { get; set; }
}
