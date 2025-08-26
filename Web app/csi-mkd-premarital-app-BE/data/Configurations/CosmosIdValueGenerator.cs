using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ValueGeneration;
using Microsoft.EntityFrameworkCore.Metadata;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Data.Configurations;

/// <summary>
/// Value generator for Cosmos DB document IDs to ensure uniqueness
/// </summary>
public class CosmosIdValueGenerator : ValueGenerator<string>
{
    public override bool GeneratesTemporaryValues => false;

    public override string Next(EntityEntry entry)
    {
        if (entry.Entity is ClassFeedback feedback)
        {
            // Create a unique ID using PremaritalRegistrationId + Email
            return $"{feedback.PremaritalRegistrationId}_{feedback.Email}".ToLowerInvariant();
        }
        
        // Fallback to Guid
        return Guid.NewGuid().ToString();
    }
}

/// <summary>
/// Factory for creating CosmosIdValueGenerator instances
/// </summary>
public class CosmosIdValueGeneratorFactory : ValueGeneratorFactory
{
    public override ValueGenerator Create(IProperty property, ITypeBase typeBase)
    {
        return new CosmosIdValueGenerator();
    }
}