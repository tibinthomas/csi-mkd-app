using Microsoft.EntityFrameworkCore;
using CsiMkdFunctions.Models;

namespace CsiMkdFunctions.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<SessionConfiguration> SessionConfigurations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<SessionConfiguration>(entity =>
            {
                entity.ToTable("SessionConfigurations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SessionName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.StartDate).IsRequired();
                entity.Property(e => e.EndDate).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.SubmittedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });
        }
    }
}