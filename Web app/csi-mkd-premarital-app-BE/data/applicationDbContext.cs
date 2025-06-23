using Microsoft.EntityFrameworkCore;
using csi_mkd_premarital_app_BE.Models;


namespace csi_mkd_premarital_app_BE.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    public DbSet<Registration> Registrations { get; set; }  
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Registration>().ToTable("Registrations");
    }

}
