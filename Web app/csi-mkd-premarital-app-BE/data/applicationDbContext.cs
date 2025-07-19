using Microsoft.EntityFrameworkCore;
using csi_mkd_premarital_app_BE.Models;
using System.Reflection;

namespace csi_mkd_premarital_app_BE.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<GeneralRegistration> GeneralRegistrations => Set<GeneralRegistration>();
        public DbSet<PremaritalRegistration> PremaritalRegistrations => Set<PremaritalRegistration>();
        public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();
        public DbSet<SessionFeedback> SessionFeedbacks => Set<SessionFeedback>();
        public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
        public DbSet<SessionConfiguration> SessionConfigurations => Set<SessionConfiguration>();
        public DbSet<EmailConfig> EmailConfigs => Set<EmailConfig>();
        public DbSet<PremaritalDocument> PremaritalDocuments => Set<PremaritalDocument>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            modelBuilder.Entity<PremaritalRegistration>()
                .HasOne(r => r.SessionConfiguration)
                .WithMany(s => s.PremaritalRegistrations)
                .HasForeignKey(r => r.SessionId)
                .OnDelete(DeleteBehavior.Restrict); // <-- prevents cascade delete

            modelBuilder.Entity<PremaritalDocument>()
                .HasKey(d => d.RegistrationId);

            modelBuilder.Entity<PremaritalDocument>()
                .HasOne(d => d.PremaritalRegistration)
                .WithOne(r => r.PremaritalDocument)
                .HasForeignKey<PremaritalDocument>(d => d.RegistrationId)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }
}