using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Data.Configurations;

/// <summary>
/// Entity configuration for AppFeedback documents in Cosmos DB.
/// </summary>
public class AppFeedbackConfiguration : IEntityTypeConfiguration<AppFeedback>
{
    public void Configure(EntityTypeBuilder<AppFeedback> builder)
    {
        builder.ToContainer("AppFeedbacks");

        builder.HasKey(e => e.Id);
        builder.HasPartitionKey(e => e.Id);

        builder.Property(e => e.Rating).IsRequired();
        builder.Property(e => e.LikedMost).HasMaxLength(2000);
        builder.Property(e => e.Improvements).HasMaxLength(2000);
        builder.Property(e => e.Page).HasMaxLength(300);
        builder.Property(e => e.Locale).HasMaxLength(10);
        builder.Property(e => e.UserAgent).HasMaxLength(500);
        builder.Property(e => e.CreatedAt).IsRequired();
    }
}
