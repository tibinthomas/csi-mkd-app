using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using csi_mkd_premarital_app_BE.Models;
using System.Text.Json;

namespace csi_mkd_premarital_app_BE.Data.Configurations;

/// <summary>
/// Entity configuration for ClassFeedback in PostgreSQL context.
/// Configures JSON serialization for the Feedbacks dictionary.
/// </summary>
public class ClassFeedbackPostgresConfiguration : IEntityTypeConfiguration<ClassFeedback>
{
    public static readonly JsonSerializerOptions JsonOptions = new();

    public void Configure(EntityTypeBuilder<ClassFeedback> builder)
    {
        // Only apply this configuration for PostgreSQL (ApplicationDbContext)
        // This should not be applied to CosmosDb context
        
        // Configure Feedbacks dictionary to be stored as JSONB in PostgreSQL
        builder.Property(e => e.Feedbacks)
               .HasConversion(
                   v => JsonSerializer.Serialize(v, JsonOptions),
                   v => JsonSerializer.Deserialize<Dictionary<string, ClassFeedbackDetail>>(v, JsonOptions) ?? new Dictionary<string, ClassFeedbackDetail>()
               )
               .HasColumnType("jsonb")
               .Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<Dictionary<string, ClassFeedbackDetail>>(
                   (c1, c2) => c1!.SequenceEqual(c2!),
                   c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                   c => new Dictionary<string, ClassFeedbackDetail>(c)));
    }
}