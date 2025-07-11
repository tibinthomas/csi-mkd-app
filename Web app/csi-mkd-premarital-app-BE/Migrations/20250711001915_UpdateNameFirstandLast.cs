using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class UpdateNameFirstandLast : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "SessionFeedbacks",
                newName: "LastName");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "PremaritalRegistrations",
                newName: "LastName");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "GeneralRegistrations",
                newName: "LastName");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "SessionFeedbacks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "PremaritalRegistrations",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "GeneralRegistrations",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "SessionFeedbacks");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "PremaritalRegistrations");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "GeneralRegistrations");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "SessionFeedbacks",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "PremaritalRegistrations",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "GeneralRegistrations",
                newName: "Name");
        }
    }
}
