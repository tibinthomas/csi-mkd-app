using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class MakePremaritalRegistrationIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassFeedbacks_PremaritalRegistrations_PremaritalRegistrati~",
                table: "ClassFeedbacks");

            migrationBuilder.AlterColumn<int>(
                name: "PremaritalRegistrationId",
                table: "ClassFeedbacks",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

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
                    Metadata_PremaritalRegistrationId = table.Column<int>(type: "integer", nullable: false, comment: "Foreign key to registration in PostgreSQL"),
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

            migrationBuilder.AddForeignKey(
                name: "FK_ClassFeedbacks_PremaritalRegistrations_PremaritalRegistrati~",
                table: "ClassFeedbacks",
                column: "PremaritalRegistrationId",
                principalTable: "PremaritalRegistrations",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassFeedbacks_PremaritalRegistrations_PremaritalRegistrati~",
                table: "ClassFeedbacks");

            migrationBuilder.DropTable(
                name: "FeedbackDocument");

            migrationBuilder.AlterColumn<int>(
                name: "PremaritalRegistrationId",
                table: "ClassFeedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassFeedbacks_PremaritalRegistrations_PremaritalRegistrati~",
                table: "ClassFeedbacks",
                column: "PremaritalRegistrationId",
                principalTable: "PremaritalRegistrations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
