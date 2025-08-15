namespace csi_mkd_premarital_app_BE.Data.Configurations;

/// <summary>
/// Constants for Cosmos DB container names.
/// Centralized location for all container naming.
/// </summary>
public static class CosmosContainers
{
    public const string Feedbacks = "Feedbacks";
    
    // Future containers can be added here
    // public const string UserActivities = "UserActivities";
    // public const string Analytics = "Analytics";
    // public const string AuditLogs = "AuditLogs";
}

/// <summary>
/// Constants for Cosmos DB field length limits and constraints.
/// Ensures consistency across all document configurations.
/// </summary>
public static class CosmosLimits
{
    // General limits
    public const int DefaultStringMaxLength = 4000;
    public const int PartitionKeyMaxLength = 50;
    
    // Text field limits
    public const int ShortTextMaxLength = 100;
    public const int MediumTextMaxLength = 500;
    public const int LongTextMaxLength = 2000;
    public const int TitleMaxLength = 200;
    public const int NameMaxLength = 100;
    public const int LocationMaxLength = 200;
    public const int VersionMaxLength = 20;
    public const int SourceMaxLength = 50;
    public const int PlatformMaxLength = 100;
    
    // Technical field limits
    public const int UserAgentMaxLength = 500;
    public const int IpAddressMaxLength = 45; // IPv6 max length
    public const int EmailMaxLength = 255;
    public const int UrlMaxLength = 2000;
    
    // Numeric precision
    public const int DecimalPrecision = 19;
    public const int DecimalScale = 4;
    
    // Common ranges
    public const int RatingMinValue = 1;
    public const int RatingMaxValue = 5;
}