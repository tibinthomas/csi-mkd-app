using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class RowVersionNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "SessionFeedbacks",
                type: "bytea",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea");

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "PremaritalRegistrations",
                type: "bytea",
                rowVersion: true,
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true);

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "GeneralRegistrations",
                type: "bytea",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea");

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "AuditEntries",
                type: "bytea",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea");

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "AdminUsers",
                type: "bytea",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "SessionFeedbacks",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0],
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldNullable: true);

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "PremaritalRegistrations",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0],
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true,
                oldNullable: true);

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "GeneralRegistrations",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0],
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldNullable: true);

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "AuditEntries",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0],
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldNullable: true);

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "AdminUsers",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0],
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldNullable: true);
        }
    }
}
