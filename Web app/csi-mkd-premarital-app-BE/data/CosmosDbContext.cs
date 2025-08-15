using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Data
{
    public class CosmosDbContext : DbContext
    {
        public CosmosDbContext(DbContextOptions<CosmosDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Basic Cosmos DB configuration
            // Add container configurations here when needed
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            base.ConfigureConventions(configurationBuilder);
            
            // Optimize for Cosmos DB
            configurationBuilder.Properties<string>().HaveMaxLength(4000);
            configurationBuilder.Properties<decimal>().HavePrecision(19, 4);
        }
    }
}