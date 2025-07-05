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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}