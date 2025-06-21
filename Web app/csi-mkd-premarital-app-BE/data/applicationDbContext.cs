using Microsoft.EntityFrameworkCore;
using csi-mkd-premarital-app-BE.Models;


namespace csi-mkd-premarital-app-BE.Data;

    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Student> Students { get; set; }

        // Optional: Fluent API for more advanced model configuration
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Student>().ToTable("Students");
            base.OnModelCreating(modelBuilder);
        }
    }
