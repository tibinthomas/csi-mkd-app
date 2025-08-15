using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Data.Configurations;

/// <summary>
/// Entity configuration for FeedbackDocument in Cosmos DB.
/// Handles all business-specific configuration for feedback documents.
/// </summary>
public class FeedbackDocumentConfiguration : BaseCosmosDocumentConfiguration<FeedbackDocument>
{
    public override void Configure(EntityTypeBuilder<FeedbackDocument> builder)
    {
        // Configure base Cosmos DB properties
        ConfigureBaseProperties(builder, CosmosContainers.Feedbacks);
        
        // Configure partitioning strategy
        builder.HasPartitionKey(x => x.PartitionKey);

        // Primary properties
        ConfigurePrimaryProperties(builder);
        
        // Nested objects
        ConfigureRatingsProperties(builder);
        ConfigureTextResponseProperties(builder);
        ConfigureMetadataProperties(builder);
    }

    /// <summary>
    /// Configures the primary properties of FeedbackDocument.
    /// </summary>
    private static void ConfigurePrimaryProperties(EntityTypeBuilder<FeedbackDocument> builder)
    {
        builder.Property(e => e.id)
               .ValueGeneratedOnAdd();
               
        builder.Property(e => e.PartitionKey)
               .IsRequired()
               .HasMaxLength(CosmosLimits.PartitionKeyMaxLength);
               
        builder.Property(e => e.ClassId)
               .IsRequired();
               
        builder.Property(e => e.Date)
               .IsRequired();
               
        builder.Property(e => e.SubmittedAt)
               .IsRequired();
    }

    /// <summary>
    /// Configures the Ratings nested object with validation constraints.
    /// </summary>
    private static void ConfigureRatingsProperties(EntityTypeBuilder<FeedbackDocument> builder)
    {
        builder.OwnsOne(e => e.Ratings, ratings =>
        {
            ratings.Property(r => r.Quality)
                   .IsRequired()
                   .HasComment("Rating from 1-5 for content quality");
                   
            ratings.Property(r => r.Relevance)
                   .IsRequired()
                   .HasComment("Rating from 1-5 for content relevance");
                   
            ratings.Property(r => r.Engagement)
                   .IsRequired()
                   .HasComment("Rating from 1-5 for engagement level");
                   
            ratings.Property(r => r.Organization)
                   .IsRequired()
                   .HasComment("Rating from 1-5 for organization quality");
        });
    }

    /// <summary>
    /// Configures the TextResponses nested object with length constraints.
    /// </summary>
    private static void ConfigureTextResponseProperties(EntityTypeBuilder<FeedbackDocument> builder)
    {
        builder.OwnsOne(e => e.TextResponses, text =>
        {
            text.Property(t => t.Valuable)
                .HasMaxLength(CosmosLimits.LongTextMaxLength)
                .HasComment("What was most valuable about the session");
                
            text.Property(t => t.Improvements)
                .HasMaxLength(CosmosLimits.LongTextMaxLength)
                .HasComment("Suggested improvements for the session");
                
            text.Property(t => t.Comments)
                .HasMaxLength(CosmosLimits.LongTextMaxLength)
                .HasComment("Additional comments and feedback");
        });
    }

    /// <summary>
    /// Configures the Metadata nested object for analytics and tracking.
    /// </summary>
    private static void ConfigureMetadataProperties(EntityTypeBuilder<FeedbackDocument> builder)
    {
        builder.OwnsOne(e => e.Metadata, metadata =>
        {
            // Required fields
            metadata.Property(m => m.PremaritalRegistrationId)
                    .IsRequired()
                    .HasComment("Foreign key to registration in PostgreSQL");
                    
            metadata.Property(m => m.CreatedAt)
                    .IsRequired();
                    
            metadata.Property(m => m.Version)
                    .IsRequired()
                    .HasMaxLength(CosmosLimits.VersionMaxLength)
                    .HasDefaultValue("1.0");

            // Session information
            metadata.Property(m => m.SessionTitle)
                    .HasMaxLength(CosmosLimits.TitleMaxLength);
                    
            metadata.Property(m => m.InstructorName)
                    .HasMaxLength(CosmosLimits.NameMaxLength);
                    
            metadata.Property(m => m.Location)
                    .HasMaxLength(CosmosLimits.LocationMaxLength);
                    
            metadata.Property(m => m.SessionDuration);

            // Technical metadata
            metadata.Property(m => m.UserAgent)
                    .HasMaxLength(CosmosLimits.UserAgentMaxLength);
                    
            metadata.Property(m => m.IpAddress)
                    .HasMaxLength(CosmosLimits.IpAddressMaxLength);
                    
            metadata.Property(m => m.Source)
                    .HasMaxLength(CosmosLimits.SourceMaxLength)
                    .HasDefaultValue("web");
                    
            metadata.Property(m => m.Platform)
                    .HasMaxLength(CosmosLimits.PlatformMaxLength);
        });
    }
}