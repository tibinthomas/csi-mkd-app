using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class UpdateClassFeedbackWithBaseEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassFeedbacks_PremaritalRegistrations_PremaritalRegistrati~",
                table: "ClassFeedbacks");

            migrationBuilder.DropIndex(
                name: "IX_ClassFeedbacks_PremaritalRegistrationId",
                table: "ClassFeedbacks");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ClassFeedbacks",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "FeedbacksJson",
                table: "ClassFeedbacks",
                type: "character varying(8000)",
                maxLength: 8000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "ClassFeedbacks",
                type: "character varying(254)",
                maxLength: 254,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "FeedbacksJson",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(8000)",
                oldMaxLength: 8000);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(254)",
                oldMaxLength: 254);

            migrationBuilder.CreateIndex(
                name: "IX_ClassFeedbacks_PremaritalRegistrationId",
                table: "ClassFeedbacks",
                column: "PremaritalRegistrationId");

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
