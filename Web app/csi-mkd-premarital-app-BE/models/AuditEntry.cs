public class AuditEntry
{
    public int Id { get; set; }
    public required string TableName { get; set; }
    public required string ActionType { get; set; } // Insert / Update / Delete
    public DateTime Timestamp { get; set; }
    public string? UserId { get; set; }     // If available (from auth)
    public string? KeyValues { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
}
