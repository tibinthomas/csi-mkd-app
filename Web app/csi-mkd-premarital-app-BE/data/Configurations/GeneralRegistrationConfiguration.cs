using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Data.Configurations
{
    public class GeneralRegistrationConfiguration : IEntityTypeConfiguration<GeneralRegistration>
    {
        public void Configure(EntityTypeBuilder<GeneralRegistration> builder)
        {
            builder.ToTable("GeneralRegistrations");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).UseIdentityColumn();

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.FatherName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Address)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(x => x.Sex)
                .IsRequired()
                .HasMaxLength(10);

            builder.Property(x => x.Age)
                .IsRequired();

            builder.Property(x => x.Education)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Occupation)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.ChurchName)
                .HasMaxLength(200);

            builder.Property(x => x.Phone)
                .IsRequired()
                .HasMaxLength(10);

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.MaritalStatus)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.SessionType)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.PhotoPath)
                .HasMaxLength(500);

            // Add indexes
            builder.HasIndex(x => x.Email);
            builder.HasIndex(x => x.Phone);
        }
    }
}
