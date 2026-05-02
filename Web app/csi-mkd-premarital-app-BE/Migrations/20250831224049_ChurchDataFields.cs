using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class ChurchDataFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ConfirmationRegistrations_ChurchName",
                table: "ConfirmationRegistrations");

            migrationBuilder.DropColumn(
                name: "ChurchName",
                table: "PremaritalRegistrations");

            migrationBuilder.DropColumn(
                name: "ChurchName",
                table: "ConfirmationRegistrations");

            migrationBuilder.RenameColumn(
                name: "ChurchName",
                table: "GeneralRegistrations",
                newName: "PriestName");

            migrationBuilder.AddColumn<int>(
                name: "ChurchId",
                table: "PremaritalRegistrations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PriestName",
                table: "PremaritalRegistrations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChurchId",
                table: "GeneralRegistrations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChurchId",
                table: "ConfirmationRegistrations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PriestName",
                table: "ConfirmationRegistrations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ClassFeedback",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PremaritalRegistrationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Feedbacks = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                    PartitionKey = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Ratings_Quality = table.Column<int>(type: "integer", nullable: false, comment: "Rating from 1-5 for content quality"),
                    Ratings_Relevance = table.Column<int>(type: "integer", nullable: false, comment: "Rating from 1-5 for content relevance"),
                    Ratings_Engagement = table.Column<int>(type: "integer", nullable: false, comment: "Rating from 1-5 for engagement level"),
                    Ratings_Organization = table.Column<int>(type: "integer", nullable: false, comment: "Rating from 1-5 for organization quality"),
                    TextResponses_Valuable = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "What was most valuable about the session"),
                    TextResponses_Improvements = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Suggested improvements for the session"),
                    TextResponses_Comments = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Additional comments and feedback"),
                    Metadata_PremaritalRegistrationId = table.Column<Guid>(type: "uuid", nullable: false, comment: "Foreign key to registration in PostgreSQL"),
                    Metadata_SessionTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Metadata_InstructorName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Metadata_SessionDuration = table.Column<int>(type: "integer", nullable: true),
                    Metadata_Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Metadata_UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Metadata_IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    Metadata_CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Metadata_Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "1.0"),
                    Metadata_Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "web"),
                    Metadata_Platform = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                    PremaritalRegistrationId = table.Column<Guid>(type: "uuid", nullable: false, comment: "Reference to the premarital registration in PostgreSQL"),
                    DefinitionOfMarriage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Definition of marriage"),
                    WishesConcerns = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Wishes and concerns about marriage"),
                    ChurchImportance = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Importance of church in relationship"),
                    FamilyBackground = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Family background description"),
                    ParentsHealthImpact = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Impact of parents' health on relationship"),
                    EldestYoungestScenario = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Eldest/youngest family scenarios"),
                    ExpectationsFromPartner = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Expectations from partner"),
                    UnderstandingAboutSex = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Understanding about sex in marriage"),
                    FearsAboutMarriage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Fears about marriage"),
                    TimeWithPartner = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Time spent with partner"),
                    AgeDifferenceImpact = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Impact of age difference"),
                    RelationshipWithParentsInlaws = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Relationship with parents and in-laws"),
                    GreatestAdjustment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true, comment: "Answer to: Greatest adjustment in marriage"),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, comment: "Timestamp when the document was created"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true, comment: "Timestamp when the document was last updated"),
                    Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "1.0", comment: "Document schema version for evolution tracking"),
                    SubmitterIpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true, comment: "IP address of the person who submitted the questionnaire"),
                    SubmitterUserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true, comment: "User agent of the browser used to submit the questionnaire")
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
                    Detail_Ratings_Quality = table.Column<int>(type: "integer", nullable: false),
                    Detail_Ratings_Relevance = table.Column<int>(type: "integer", nullable: false),
                    Detail_Ratings_Engagement = table.Column<int>(type: "integer", nullable: false),
                    Detail_Ratings_Organization = table.Column<int>(type: "integer", nullable: false),
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

            migrationBuilder.CreateIndex(
                name: "IX_ConfirmationRegistrations_ChurchId",
                table: "ConfirmationRegistrations",
                column: "ChurchId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassFeedbackEntry");

            migrationBuilder.DropTable(
                name: "FeedbackDocument");

            migrationBuilder.DropTable(
                name: "QuestionAnswers");

            migrationBuilder.DropTable(
                name: "ClassFeedback");

            migrationBuilder.DropIndex(
                name: "IX_ConfirmationRegistrations_ChurchId",
                table: "ConfirmationRegistrations");

            migrationBuilder.DropColumn(
                name: "ChurchId",
                table: "PremaritalRegistrations");

            migrationBuilder.DropColumn(
                name: "PriestName",
                table: "PremaritalRegistrations");

            migrationBuilder.DropColumn(
                name: "ChurchId",
                table: "GeneralRegistrations");

            migrationBuilder.DropColumn(
                name: "ChurchId",
                table: "ConfirmationRegistrations");

            migrationBuilder.DropColumn(
                name: "PriestName",
                table: "ConfirmationRegistrations");

            migrationBuilder.RenameColumn(
                name: "PriestName",
                table: "GeneralRegistrations",
                newName: "ChurchName");

            migrationBuilder.AddColumn<string>(
                name: "ChurchName",
                table: "PremaritalRegistrations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ChurchName",
                table: "ConfirmationRegistrations",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ConfirmationRegistrations_ChurchName",
                table: "ConfirmationRegistrations",
                column: "ChurchName");
        }
    }
}
