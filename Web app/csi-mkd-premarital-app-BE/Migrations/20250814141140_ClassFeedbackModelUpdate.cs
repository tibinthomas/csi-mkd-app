using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class ClassFeedbackModelUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "ClassFeedbacks");

            migrationBuilder.AddColumn<int>(
                name: "PremaritalRegistrationId",
                table: "ClassFeedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassFeedbacks_PremaritalRegistrations_PremaritalRegistrati~",
                table: "ClassFeedbacks");

            migrationBuilder.DropIndex(
                name: "IX_ClassFeedbacks_PremaritalRegistrationId",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "PremaritalRegistrationId",
                table: "ClassFeedbacks");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }
    }
}
