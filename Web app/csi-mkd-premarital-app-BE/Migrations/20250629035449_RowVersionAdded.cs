using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class RowVersionAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "SessionFeedbacks",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "GeneralRegistrations",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "AuditEntries",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "AdminUsers",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "SessionFeedbacks");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "GeneralRegistrations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "AuditEntries");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "AdminUsers");
        }
    }
}
