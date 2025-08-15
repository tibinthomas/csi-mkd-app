using System.Reflection;
using Microsoft.EntityFrameworkCore;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Data.Configurations;

namespace csi_mkd_premarital_app_BE.Data;

/// <summary>
/// Generic Cosmos DB context for NoSQL document storage.
/// Uses configuration classes to maintain separation of concerns.
/// </summary>
public class CosmosDbContext(DbContextOptions<CosmosDbContext> options) : DbContext(options)
{
    #region DbSets
    
    // Entity DbSets - Add new entities here as needed
    public DbSet<FeedbackDocument> Feedbacks => Set<FeedbackDocument>();
    
    // Future DbSets can be added here
    // public DbSet<UserActivityDocument> UserActivities => Set<UserActivityDocument>();
    // public DbSet<AnalyticsDocument> Analytics => Set<AnalyticsDocument>();
    
    #endregion

    #region Configuration

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all entity configurations from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
        
        ApplyCosmosDbConventions(configurationBuilder);
    }

    #endregion

    #region Cosmos DB Conventions

    /// <summary>
    /// Applies Cosmos DB specific conventions and optimizations.
    /// These are global settings that apply to all entities.
    /// </summary>
    private static void ApplyCosmosDbConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Set default string length to Cosmos DB's practical limit
        configurationBuilder.Properties<string>()
                          .HaveMaxLength(CosmosLimits.DefaultStringMaxLength);
        
        // Configure decimal precision for monetary and rating values
        configurationBuilder.Properties<decimal>()
                          .HavePrecision(CosmosLimits.DecimalPrecision, CosmosLimits.DecimalScale);
        
        // Ensure DateTime properties are handled consistently
        configurationBuilder.Properties<DateTime>()
                          .HaveConversion<DateTime>();
                          
        // Configure nullable DateTime properties
        configurationBuilder.Properties<DateTime?>()
                          .HaveConversion<DateTime?>();
    }

    #endregion
}