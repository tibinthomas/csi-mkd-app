using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class ChurchDataFieldsUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassFeedbackEntry");

            migrationBuilder.DropTable(
                name: "FeedbackDocument");

            migrationBuilder.DropTable(
                name: "QuestionAnswers");

            migrationBuilder.DropTable(
                name: "ClassFeedback");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassFeedback",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Feedbacks = table.Column<string>(type: "jsonb", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PremaritalRegistrationId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassFeedback", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "FeedbackDocument",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PartitionKey = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Metadata_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Metadata_InstructorName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Metadata_IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    Metadata_Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Metadata_Platform = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Metadata_PremaritalRegistrationId = table.Column<Guid>(type: "uuid", nullable: false, comment: "Foreign key to registration in PostgreSQL"),
                    Metadata_SessionDuration = table.Column<int>(type: "integer", nullable: true),
                    Metadata_SessionTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Metadata_Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "web"),
                    Metadata_UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Metadata_Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "1.0"),
                    Ratings_Engagement = table.Column<int>(type: "integer", nullable: false, comment: "Rating from 1-5 for engagement level"),
                    Ratings_Organization = table.Column<int>(type: "integer", nullable: false, comment: "Rating from 1-5 for organization quality"),
                    Ratings_Quality = table.Column<int>(type: "integer", nullable: false, comment: "Rating from 1-5 for content quality"),
                    Ratings_Relevance = table.Column<int>(type: "integer", nullable: false, comment: "Rating from 1-5 for content relevance"),
                    TextResponses_Comments = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Additional comments and feedback"),
                    TextResponses_Improvements = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Suggested improvements for the session"),
                    TextResponses_Valuable = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "What was most valuable about the session")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedbackDocument", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionAnswers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AgeDifferenceImpact = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Impact of age difference"),
                    ChurchImportance = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Importance of church in relationship"),
                    DefinitionOfMarriage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Definition of marriage"),
                    EldestYoungestScenario = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Eldest/youngest family scenarios"),
                    ExpectationsFromPartner = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Expectations from partner"),
                    FamilyBackground = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Family background description"),
                    FearsAboutMarriage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Fears about marriage"),
                    GreatestAdjustment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Greatest adjustment in marriage"),
                    ParentsHealthImpact = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Impact of parents' health on relationship"),
                    PremaritalRegistrationId = table.Column<Guid>(type: "uuid", nullable: false, comment: "Reference to the premarital registration in PostgreSQL"),
                    RelationshipWithParentsInlaws = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Relationship with parents and in-laws"),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, comment: "Timestamp when the document was created"),
                    SubmitterIpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true, comment: "IP address of the person who submitted the questionnaire"),
                    SubmitterUserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true, comment: "User agent of the browser used to submit the questionnaire"),
                    TimeWithPartner = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Time spent with partner"),
                    UnderstandingAboutSex = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Understanding about sex in marriage"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, comment: "Timestamp when the document was last updated"),
                    Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "1.0", comment: "Document schema version for evolution tracking"),
                    WishesConcerns = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Wishes and concerns about marriage")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionAnswers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClassFeedbackEntry",
                columns: table => new
                {
                    ClassFeedbackid = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClassId = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Detail_Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Detail_InstructorId = table.Column<int>(type: "integer", nullable: false),
                    Detail_Ratings_Engagement = table.Column<int>(type: "integer", nullable: false),
                    Detail_Ratings_Organization = table.Column<int>(type: "integer", nullable: false),
                    Detail_Ratings_Quality = table.Column<int>(type: "integer", nullable: false),
                    Detail_Ratings_Relevance = table.Column<int>(type: "integer", nullable: false),
                    Detail_TextResponses_Comments = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Detail_TextResponses_Improvements = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Detail_TextResponses_Valuable = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassFeedbackEntry", x => new { x.ClassFeedbackid, x.Id });
                    table.ForeignKey(
                        name: "FK_ClassFeedbackEntry_ClassFeedback_ClassFeedbackid",
                        column: x => x.ClassFeedbackid,
                        principalTable: "ClassFeedback",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });
        }
    }
}
