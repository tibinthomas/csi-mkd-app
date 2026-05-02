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
        public DbSet<PremaritalRegistration> PremaritalRegistrations { get; set; }
        public DbSet<PremaritalDocument> PremaritalDocuments { get; set; }
        public DbSet<PremaritalOutsideKeralaRegistration> PremaritalOutsideKeralaRegistrations { get; set; }
        public DbSet<PremaritalOutsideKeralaDocument> PremaritalOutsideKeralaDocuments { get; set; }

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

            modelBuilder.Entity<PremaritalRegistration>(entity =>
            {
                entity.ToTable("PremaritalRegistrations");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.SessionConfiguration)
                      .WithMany()
                      .HasForeignKey(e => e.SessionId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PremaritalDocument>(entity =>
            {
                entity.ToTable("PremaritalDocuments");
                entity.HasKey(e => e.RegistrationId);
                entity.HasOne(e => e.PremaritalRegistration)
                      .WithOne(r => r.PremaritalDocument)
                      .HasForeignKey<PremaritalDocument>(e => e.RegistrationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PremaritalOutsideKeralaRegistration>(entity =>
            {
                entity.ToTable("PremaritalOutsideKeralaRegistrations");
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<PremaritalOutsideKeralaDocument>(entity =>
            {
                entity.ToTable("PremaritalOutsideKeralaDocuments");
                entity.HasKey(e => e.RegistrationId);
                entity.HasOne(e => e.PremaritalOutsideKeralaRegistration)
                      .WithOne(r => r.PremaritalOutsideKeralaDocument)
                      .HasForeignKey<PremaritalOutsideKeralaDocument>(e => e.RegistrationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}