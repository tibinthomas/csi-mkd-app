using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Data.Configurations;

/// <summary>
/// Entity configuration for ClassFeedback in Cosmos DB context.
/// Configures document structure and ignores relational properties.
/// </summary>
public class ClassFeedbackConfiguration : IEntityTypeConfiguration<ClassFeedback>
{
    public void Configure(EntityTypeBuilder<ClassFeedback> builder)
    {
        // Configure as Cosmos DB document
        builder.ToContainer("ClassFeedbacks");
        
        // Set partition key - using PremaritalRegistrationId for better partitioning
        builder.HasPartitionKey(e => e.PremaritalRegistrationId);
        
        // Configure the primary key - ignore BaseEntity.Id, use PremaritalRegistrationId + Email  
        builder.Ignore(e => e.Id);
        builder.Ignore(e => e.CreatedBy);
        builder.Ignore(e => e.LastModifiedAt);
        builder.Ignore(e => e.LastModifiedBy);
        
        // Create a custom ID using PremaritalRegistrationId + Email hash for uniqueness
        builder.Property<string>("id")
               .HasValueGeneratorFactory<CosmosIdValueGeneratorFactory>();
        
        // Ignore navigation properties that don't make sense in Cosmos DB
        builder.Ignore(e => e.PremaritalRegistration);
        
        // Configure required properties
        builder.Property(e => e.Email)
               .IsRequired()
               .HasMaxLength(254);
               
        builder.Property(e => e.Name)
               .IsRequired()
               .HasMaxLength(200);
               
        // Configure FeedbackEntries as owned entities for native JSON storage in CosmosDB
        builder.OwnsMany(e => e.FeedbackEntries, fb =>
        {
            fb.Property(f => f.ClassId).IsRequired();
            fb.OwnsOne(f => f.Detail, d =>
            {
                d.OwnsOne(detail => detail.Ratings);
                d.OwnsOne(detail => detail.TextResponses);
            });
        });
        
        // Ignore the Feedbacks dictionary property since it's computed from FeedbackEntries
        builder.Ignore(e => e.Feedbacks);
        
        // Configure timestamps
        builder.Property(e => e.CreatedAt)
               .IsRequired();
               
        builder.Property(e => e.UpdatedAt)
               .IsRequired();
        
        // Note: Cosmos DB handles indexing automatically through its own indexing policies
        // EF Core index definitions are not supported and should not be used
    }
}