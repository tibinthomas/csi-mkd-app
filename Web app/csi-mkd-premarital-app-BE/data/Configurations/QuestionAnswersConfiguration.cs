using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace csi_mkd_premarital_app_BE.Data.Configurations;

/// <summary>
/// Entity Framework configuration for QuestionAnswers in Cosmos DB.
/// Configures the document structure, partitioning, and constraints.
/// </summary>
public class QuestionAnswersConfiguration : IEntityTypeConfiguration<QuestionAnswers>
{
    public void Configure(EntityTypeBuilder<QuestionAnswers> builder)
    {
        // Configure as Cosmos DB document
        builder.ToContainer(CosmosContainers.QuestionAnswers)
               .HasNoDiscriminator();

        // Configure the primary key
        builder.HasKey(x => x.Id);

        // Configure partition key - use PremaritalRegistrationId for logical partitioning
        builder.HasPartitionKey(x => x.PremaritalRegistrationId);

        // Configure audit properties
        builder.Property(x => x.SubmittedAt)
               .IsRequired()
               .HasComment("Timestamp when the document was created");

        builder.Property(x => x.UpdatedAt)
               .HasComment("Timestamp when the document was last updated");

        // Configure versioning
        builder.Property(x => x.Version)
               .IsRequired()
               .HasMaxLength(20)
               .HasDefaultValue("1.0")
               .HasComment("Document schema version for evolution tracking");

        // Configure required properties
        builder.Property(x => x.PremaritalRegistrationId)
               .IsRequired()
               .HasComment("Reference to the premarital registration in PostgreSQL");

        // Configure all answer fields with appropriate lengths
        builder.Property(x => x.DefinitionOfMarriage)
               .HasMaxLength(2000)
               .HasComment("Answer to: Definition of marriage");
        
        builder.Property(x => x.WishesConcerns)
               .HasMaxLength(2000)
               .HasComment("Answer to: Wishes and concerns about marriage");
        
        builder.Property(x => x.ChurchImportance)
               .HasMaxLength(2000)
               .HasComment("Answer to: Importance of church in relationship");
        
        builder.Property(x => x.FamilyBackground)
               .HasMaxLength(2000)
               .HasComment("Answer to: Family background description");
        
        builder.Property(x => x.ParentsHealthImpact)
               .HasMaxLength(2000)
               .HasComment("Answer to: Impact of parents' health on relationship");
        
        builder.Property(x => x.EldestYoungestScenario)
               .HasMaxLength(2000)
               .HasComment("Answer to: Eldest/youngest family scenarios");
        
        builder.Property(x => x.ExpectationsFromPartner)
               .HasMaxLength(2000)
               .HasComment("Answer to: Expectations from partner");
        
        builder.Property(x => x.UnderstandingAboutSex)
               .HasMaxLength(2000)
               .HasComment("Answer to: Understanding about sex in marriage");
        
        builder.Property(x => x.FearsAboutMarriage)
               .HasMaxLength(2000)
               .HasComment("Answer to: Fears about marriage");
        
        builder.Property(x => x.TimeWithPartner)
               .HasMaxLength(2000)
               .HasComment("Answer to: Time spent with partner");
        
        builder.Property(x => x.AgeDifferenceImpact)
               .HasMaxLength(2000)
               .HasComment("Answer to: Impact of age difference");
        
        builder.Property(x => x.RelationshipWithParentsInlaws)
               .HasMaxLength(2000)
               .HasComment("Answer to: Relationship with parents and in-laws");
        
        builder.Property(x => x.GreatestAdjustment)
               .HasMaxLength(2000)
               .HasComment("Answer to: Greatest adjustment in marriage");

        // Configure audit fields
        builder.Property(x => x.SubmitterIpAddress)
               .HasMaxLength(45)
               .HasComment("IP address of the person who submitted the questionnaire");

        builder.Property(x => x.SubmitterUserAgent)
               .HasMaxLength(500)
               .HasComment("User agent of the browser used to submit the questionnaire");
    }
}