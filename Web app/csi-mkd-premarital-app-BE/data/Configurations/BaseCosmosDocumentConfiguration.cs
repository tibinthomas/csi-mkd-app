using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace csi_mkd_premarital_app_BE.Data.Configurations;

/// <summary>
/// Base configuration class for Cosmos DB documents.
/// Provides common configuration patterns for all document types.
/// </summary>
public abstract class BaseCosmosDocumentConfiguration<TEntity> : IEntityTypeConfiguration<TEntity>
    where TEntity : class
{
    public abstract void Configure(EntityTypeBuilder<TEntity> builder);

    /// <summary>
    /// Configures common Cosmos DB document properties.
    /// Call this method in derived configurations for consistent setup.
    /// </summary>
    protected static void ConfigureBaseProperties<T>(EntityTypeBuilder<T> builder, string containerName)
        where T : class
    {
        // Every Cosmos document needs these basic configurations
        builder.ToContainer(containerName)
               .HasNoDiscriminator();
    }

    /// <summary>
    /// Configures standard audit properties that most documents should have.
    /// Example usage: ConfigureAuditProperties(builder, x => x.CreatedAt, x => x.UpdatedAt);
    /// </summary>
    protected static void ConfigureAuditProperties<T>(EntityTypeBuilder<T> builder,
        System.Linq.Expressions.Expression<System.Func<T, DateTime>> createdAtSelector,
        System.Linq.Expressions.Expression<System.Func<T, DateTime?>>? updatedAtSelector = null)
        where T : class
    {
        builder.Property(createdAtSelector)
               .IsRequired()
               .HasComment("Timestamp when the document was created");

        if (updatedAtSelector != null)
        {
            builder.Property(updatedAtSelector)
                   .HasComment("Timestamp when the document was last updated");
        }
    }

    /// <summary>
    /// Configures versioning properties for document evolution.
    /// Example usage: ConfigureVersioning(builder, x => x.Version);
    /// </summary>
    protected static void ConfigureVersioning<T>(EntityTypeBuilder<T> builder,
        System.Linq.Expressions.Expression<System.Func<T, string>> versionSelector)
        where T : class
    {
        builder.Property(versionSelector)
               .IsRequired()
               .HasMaxLength(CosmosLimits.VersionMaxLength)
               .HasDefaultValue("1.0")
               .HasComment("Document schema version for evolution tracking");
    }
}