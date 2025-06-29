using Microsoft.EntityFrameworkCore;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<GeneralRegistration> GeneralRegistrations { get; set; }
    public DbSet<PremaritalRegistration> PremaritalRegistrations { get; set; }
    public DbSet<AuditEntry> AuditEntries { get; set; }
    public DbSet<SessionFeedback> SessionFeedbacks { get; set; }
    public DbSet<AdminUser> AdminUsers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // GeneralRegistration RowVersion
        modelBuilder.Entity<GeneralRegistration>()
            .Property(p => p.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();


        // PremaritalRegistration RowVersion
        modelBuilder.Entity<PremaritalRegistration>()
            .Property(p => p.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();

        // AuditEntry RowVersion (if needed)
        modelBuilder.Entity<AuditEntry>()
            .Property(p => p.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();

        // SessionFeedback RowVersion (if needed)
        modelBuilder.Entity<SessionFeedback>()
            .Property(p => p.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();

        // AdminUser RowVersion (if needed)
        modelBuilder.Entity<AdminUser>()
            .Property(p => p.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();
    }
}

