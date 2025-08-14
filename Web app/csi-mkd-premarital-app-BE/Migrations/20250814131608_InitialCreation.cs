using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TableName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ActionType = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    KeyValues = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    OldValues = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    NewValues = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClassFeedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClassTitle = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    LastName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Email = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    QualityRating = table.Column<int>(type: "integer", nullable: false),
                    RelevanceRating = table.Column<int>(type: "integer", nullable: false),
                    EngagementRating = table.Column<int>(type: "integer", nullable: false),
                    OrganizationRating = table.Column<int>(type: "integer", nullable: false),
                    Valuable = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Improvements = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Comments = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassFeedbacks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConfirmationRegistrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChurchName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ConfirmationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CounsellingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Consent = table.Column<bool>(type: "boolean", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfirmationRegistrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SenderEmail = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SenderPassword = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    EmailSubject = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    EmailBodyTemplate = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GeneralRegistrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    LastName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FatherName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Sex = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Age = table.Column<int>(type: "integer", nullable: false),
                    Education = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Occupation = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ChurchName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Email = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MaritalStatus = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SessionType = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Declaration = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentStatus = table.Column<bool>(type: "boolean", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneralRegistrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SessionConfigurations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SessionName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConfirmationDocuments",
                columns: table => new
                {
                    RegistrationId = table.Column<int>(type: "integer", nullable: false),
                    VicarLetterUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfirmationDocuments", x => x.RegistrationId);
                    table.ForeignKey(
                        name: "FK_ConfirmationDocuments_ConfirmationRegistrations_Registratio~",
                        column: x => x.RegistrationId,
                        principalTable: "ConfirmationRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Participants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Age = table.Column<int>(type: "integer", nullable: false),
                    ConfirmationRegistrationId = table.Column<int>(type: "integer", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Participants_ConfirmationRegistrations_ConfirmationRegistra~",
                        column: x => x.ConfirmationRegistrationId,
                        principalTable: "ConfirmationRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GeneralDocuments",
                columns: table => new
                {
                    RegistrationId = table.Column<int>(type: "integer", nullable: false),
                    PhotoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneralDocuments", x => x.RegistrationId);
                    table.ForeignKey(
                        name: "FK_GeneralDocuments_GeneralRegistrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "GeneralRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PremaritalRegistrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    LastName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FatherName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Sex = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Age = table.Column<int>(type: "integer", nullable: false),
                    Education = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Occupation = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ChurchName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FianceName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DateOfMarriage = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Phone = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Email = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Days = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ChurchActivitiesJson = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Declaration = table.Column<bool>(type: "boolean", nullable: false),
                    SessionId = table.Column<int>(type: "integer", nullable: false),
                    PaymentStatus = table.Column<bool>(type: "boolean", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PremaritalRegistrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PremaritalRegistrations_SessionConfigurations_SessionId",
                        column: x => x.SessionId,
                        principalTable: "SessionConfigurations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PremaritalDocuments",
                columns: table => new
                {
                    RegistrationId = table.Column<int>(type: "integer", nullable: false),
                    PhotoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    VicarLetterUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PremaritalDocuments", x => x.RegistrationId);
                    table.ForeignKey(
                        name: "FK_PremaritalDocuments_PremaritalRegistrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "PremaritalRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AdminUsers",
                columns: new[] { "Id", "PasswordHash", "Username" },
                values: new object[] { 1, "$2a$11$JyS3ggBufEWrsn/v4PLe/OV/kwnMrD9e6bm0DISNeyHjDqkG/20k2", "csimkdmarry@gmail.com" });

            migrationBuilder.InsertData(
                table: "EmailConfigs",
                columns: new[] { "Id", "EmailBodyTemplate", "EmailSubject", "SenderEmail", "SenderPassword" },
                values: new object[] { 1, "<p>Hello {Name},</p>\n                <p>Thank you for registering with us.</p>\n                <p>Your registration for the counselling session has been successfully completed.</p>\n                <p>We look forward to seeing you there.</p>\n                <p>Best regards,<br/>CSI MKD Counselling Team</p>", "Confirmation: CSI MKD Counselling Session Registration", "teenateena496@gmail.com", "mrkn army mhov gggo" });

            migrationBuilder.CreateIndex(
                name: "IX_ConfirmationRegistrations_ChurchName",
                table: "ConfirmationRegistrations",
                column: "ChurchName");

            migrationBuilder.CreateIndex(
                name: "IX_ConfirmationRegistrations_SubmittedDate",
                table: "ConfirmationRegistrations",
                column: "SubmittedDate");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralRegistrations_Email",
                table: "GeneralRegistrations",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralRegistrations_PaymentStatus",
                table: "GeneralRegistrations",
                column: "PaymentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralRegistrations_SubmittedAt",
                table: "GeneralRegistrations",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Participants_ConfirmationRegistrationId",
                table: "Participants",
                column: "ConfirmationRegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_PremaritalRegistrations_Email",
                table: "PremaritalRegistrations",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_PremaritalRegistrations_PaymentStatus",
                table: "PremaritalRegistrations",
                column: "PaymentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_PremaritalRegistrations_SessionId",
                table: "PremaritalRegistrations",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_PremaritalRegistrations_SubmittedAt",
                table: "PremaritalRegistrations",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "IX_SessionConfigurations_IsActive",
                table: "SessionConfigurations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_SessionConfigurations_StartDate",
                table: "SessionConfigurations",
                column: "StartDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminUsers");

            migrationBuilder.DropTable(
                name: "AuditEntries");

            migrationBuilder.DropTable(
                name: "ClassFeedbacks");

            migrationBuilder.DropTable(
                name: "ConfirmationDocuments");

            migrationBuilder.DropTable(
                name: "EmailConfigs");

            migrationBuilder.DropTable(
                name: "GeneralDocuments");

            migrationBuilder.DropTable(
                name: "Participants");

            migrationBuilder.DropTable(
                name: "PremaritalDocuments");

            migrationBuilder.DropTable(
                name: "GeneralRegistrations");

            migrationBuilder.DropTable(
                name: "ConfirmationRegistrations");

            migrationBuilder.DropTable(
                name: "PremaritalRegistrations");

            migrationBuilder.DropTable(
                name: "SessionConfigurations");
        }
    }
}
