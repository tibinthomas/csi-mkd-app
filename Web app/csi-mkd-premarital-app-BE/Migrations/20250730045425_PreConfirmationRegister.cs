using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class PreConfirmationRegister : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfirmationRegistrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ChurchName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ConfirmationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ConfirmationTime = table.Column<string>(type: "text", nullable: false),
                    Consent = table.Column<bool>(type: "boolean", nullable: false),
                    SubmittedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfirmationRegistrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConfirmationDocuments",
                columns: table => new
                {
                    RegistrationId = table.Column<int>(type: "integer", nullable: false),
                    VicarLetterUrl = table.Column<string>(type: "text", nullable: false),
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
                name: "Participant",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Age = table.Column<int>(type: "integer", nullable: false),
                    ConfirmationRegistrationId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Participant", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Participant_ConfirmationRegistrations_ConfirmationRegistrat~",
                        column: x => x.ConfirmationRegistrationId,
                        principalTable: "ConfirmationRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Participant_ConfirmationRegistrationId",
                table: "Participant",
                column: "ConfirmationRegistrationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfirmationDocuments");

            migrationBuilder.DropTable(
                name: "Participant");

            migrationBuilder.DropTable(
                name: "ConfirmationRegistrations");
        }
    }
}
