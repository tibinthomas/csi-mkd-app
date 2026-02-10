using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class AddPremaritalOutsideKeralaRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PremaritalOutsideKeralaRegistrations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChurchId = table.Column<int>(type: "integer", nullable: true),
                    SessionStartDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    SessionEndDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PriestName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TimeZone = table.Column<string>(type: "text", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PremaritalOutsideKeralaRegistrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ParticipantsOutsideKerala",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    RegistrationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParticipantsOutsideKerala", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParticipantsOutsideKerala_PremaritalOutsideKeralaRegistrati~",
                        column: x => x.RegistrationId,
                        principalTable: "PremaritalOutsideKeralaRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PremaritalOutsideKeralaDocuments",
                columns: table => new
                {
                    RegistrationId = table.Column<Guid>(type: "uuid", nullable: false),
                    VicarLetterUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PremaritalOutsideKeralaDocuments", x => x.RegistrationId);
                    table.ForeignKey(
                        name: "FK_PremaritalOutsideKeralaDocuments_PremaritalOutsideKeralaReg~",
                        column: x => x.RegistrationId,
                        principalTable: "PremaritalOutsideKeralaRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ParticipantsOutsideKerala_RegistrationId",
                table: "ParticipantsOutsideKerala",
                column: "RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_PremaritalOutsideKeralaRegistrations_Id",
                table: "PremaritalOutsideKeralaRegistrations",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_PremaritalOutsideKeralaRegistrations_SubmittedAt",
                table: "PremaritalOutsideKeralaRegistrations",
                column: "SubmittedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ParticipantsOutsideKerala");

            migrationBuilder.DropTable(
                name: "PremaritalOutsideKeralaDocuments");

            migrationBuilder.DropTable(
                name: "PremaritalOutsideKeralaRegistrations");
        }
    }
}
