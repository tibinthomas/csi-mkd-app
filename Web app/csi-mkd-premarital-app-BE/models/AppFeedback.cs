namespace csi_mkd_premarital_app_BE.Models;

/// <summary>
/// Feedback about the web application itself (rating + open questions).
/// Stored as a Cosmos DB document; unrelated to session/class feedback.
/// </summary>
public class AppFeedback
{
    public Guid Id { get; set; }

    /// <summary>Star rating, 1–5.</summary>
    public int Rating { get; set; }

    /// <summary>Answer to "What do you like about the app?".</summary>
    public string? LikedMost { get; set; }

    /// <summary>Answer to "What could be better?".</summary>
    public string? Improvements { get; set; }

    /// <summary>Route the feedback was submitted from.</summary>
    public string? Page { get; set; }

    /// <summary>UI locale at submission time (en / ml).</summary>
    public string? Locale { get; set; }

    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; }
}
