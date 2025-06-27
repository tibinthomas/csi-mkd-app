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

}
