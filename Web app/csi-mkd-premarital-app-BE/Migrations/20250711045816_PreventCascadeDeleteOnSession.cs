using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class PreventCascadeDeleteOnSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PremaritalRegistrations_SessionConfigurations_SessionId",
                table: "PremaritalRegistrations");

            migrationBuilder.AddForeignKey(
                name: "FK_PremaritalRegistrations_SessionConfigurations_SessionId",
                table: "PremaritalRegistrations",
                column: "SessionId",
                principalTable: "SessionConfigurations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PremaritalRegistrations_SessionConfigurations_SessionId",
                table: "PremaritalRegistrations");

            migrationBuilder.AddForeignKey(
                name: "FK_PremaritalRegistrations_SessionConfigurations_SessionId",
                table: "PremaritalRegistrations",
                column: "SessionId",
                principalTable: "SessionConfigurations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
