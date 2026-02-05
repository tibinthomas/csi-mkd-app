using System.Reflection;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<PremaritalRegistration> PremaritalRegistrations => Set<PremaritalRegistration>();
        public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();
        public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
        public DbSet<SessionConfiguration> SessionConfigurations => Set<SessionConfiguration>();
        public DbSet<EmailConfig> EmailConfigs => Set<EmailConfig>();
        public DbSet<PremaritalDocument> PremaritalDocuments => Set<PremaritalDocument>();
        public DbSet<GeneralRegistration> GeneralRegistrations => Set<GeneralRegistration>();
        public DbSet<GeneralDocument> GeneralDocuments => Set<GeneralDocument>();
        public DbSet<ConfirmationRegistration> ConfirmationRegistrations => Set<ConfirmationRegistration>();
        public DbSet<ConfirmationDocument> ConfirmationDocuments => Set<ConfirmationDocument>();
        public DbSet<Participant> Participants => Set<Participant>();
        public DbSet<Instructor> Instructors => Set<Instructor>();
        public DbSet<PremaritalOutsideKeralaRegistration> PremaritalOutsideKeralaRegistrations => Set<PremaritalOutsideKeralaRegistration>();
        public DbSet<PremaritalOutsideKeralaDocument> PremaritalOutsideKeralaDocuments => Set<PremaritalOutsideKeralaDocument>();
        public DbSet<ParticipantOutsideKerala> ParticipantsOutsideKerala => Set<ParticipantOutsideKerala>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply configurations from assembly, but exclude Cosmos-specific ones
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly(),
                t => !t.Name.Contains("Cosmos"));

            // Ignore models that are only used in CosmosDbContext
            modelBuilder.Ignore<ClassFeedback>();
            modelBuilder.Ignore<QuestionAnswers>();


            // var hash = BCrypt.Net.BCrypt.HashPassword("@dmin@CS!MKD");
            // Console.WriteLine("Hashed password: " + hash);
            // Seed the AdminUser with a hashed password
            // Note: The password hash below is an example and should be replaced with a secure hash
            // for your actual application.
            // The hash below corresponds to the password "admin123" using BCrypt.
            // You can generate your own hash using BCrypt.Net.BCrypt.HashPassword("your_password_here

            modelBuilder.Entity<AdminUser>().HasData(new AdminUser
            {
                Id = 1,
                Username = "csimkdmarry@gmail.com",
                PasswordHash = "$2a$11$Bs8bRm0NuP.QM7kTlBc/6OSw.G2Dq3MjX4yZEduT1LcrNXUtNj5D."
            });

            modelBuilder.Entity<EmailConfig>().HasData(new EmailConfig
            {
                Id = 1,
                SenderEmail = "csimkdmarry@gmail.com",
                SenderPassword = "chvj gmhp bzov tllv", // consider storing securely or encrypted
                EmailSubject = "Confirmation: CSI MKD Counselling Session Registration",
                EmailBodyTemplate = @"<p>Hello {Name},</p>
                <p>Thank you for registering with us.</p>
                <p>Your registration for the counselling session has been successfully completed.</p>
                <p>We look forward to seeing you there.</p>
                <p>Best regards,<br/>CSI MKD Counselling Team</p>"
            });

            modelBuilder.Entity<AuditEntry>(b =>
              {
                  b.Property(e => e.KeyValues).HasColumnType("text");
                  b.Property(e => e.OldValues).HasColumnType("text");
                  b.Property(e => e.NewValues).HasColumnType("text");
                  b.Property(e => e.UserId).HasColumnType("text");
              });

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

            modelBuilder.Entity<ConfirmationDocument>()
                .HasKey(d => d.RegistrationId);
            modelBuilder.Entity<ConfirmationDocument>()
                .HasOne(d => d.ConfirmationRegistration)
                .WithOne(r => r.ConfirmationDocument)
                .HasForeignKey<ConfirmationDocument>(d => d.RegistrationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GeneralDocument>()
                .HasKey(d => d.RegistrationId);

            modelBuilder.Entity<GeneralDocument>()
                .HasOne(d => d.GeneralRegistration)
                .WithOne(r => r.GeneralDocument)
                .HasForeignKey<GeneralDocument>(d => d.RegistrationId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<ConfirmationRegistration>()
                .HasMany(r => r.Participants)
                .WithOne(p => p.ConfirmationRegistration)
                .HasForeignKey(p => p.ConfirmationRegistrationId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Instructor>().ToTable("Instructors", "public");

            modelBuilder.Entity<PremaritalOutsideKeralaDocument>()
                .HasKey(d => d.RegistrationId);

            modelBuilder.Entity<PremaritalOutsideKeralaDocument>()
                .HasOne(d => d.PremaritalOutsideKeralaRegistration)
                .WithOne(r => r.PremaritalOutsideKeralaDocument)
                .HasForeignKey<PremaritalOutsideKeralaDocument>(d => d.RegistrationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PremaritalOutsideKeralaRegistration>(entity =>
            {
                entity.Property(e => e.TimeZone)
                    .HasConversion(
                        v => v.HasValue ? v.Value.GetIanaId() : null,
                        v => v == null ? null : TimeZoneOptionExtensions.FromIanaId(v));
            });

            modelBuilder.Entity<ParticipantOutsideKerala>()
                .HasOne(p => p.PremaritalOutsideKeralaRegistration)
                .WithMany(r => r.Participants)
                .HasForeignKey(p => p.RegistrationId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            // Optimize string properties for better performance
            configurationBuilder.Properties<string>().HaveMaxLength(500);

            // Disable lazy loading in production for faster startup
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development")
            {
                configurationBuilder.Properties<string>().AreUnicode(false);
            }
        }
    }
}