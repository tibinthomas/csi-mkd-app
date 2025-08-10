using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class AddSearchIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_SessionConfigurations_IsActive",
                table: "SessionConfigurations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_SessionConfigurations_StartDate",
                table: "SessionConfigurations",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_PremaritalRegistrations_Email",
                table: "PremaritalRegistrations",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_PremaritalRegistrations_PaymentStatus",
                table: "PremaritalRegistrations",
                column: "PaymentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_PremaritalRegistrations_SubmittedAt",
                table: "PremaritalRegistrations",
                column: "SubmittedAt");

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
                name: "IX_ConfirmationRegistrations_ChurchName",
                table: "ConfirmationRegistrations",
                column: "ChurchName");

            migrationBuilder.CreateIndex(
                name: "IX_ConfirmationRegistrations_SubmittedDate",
                table: "ConfirmationRegistrations",
                column: "SubmittedDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SessionConfigurations_IsActive",
                table: "SessionConfigurations");

            migrationBuilder.DropIndex(
                name: "IX_SessionConfigurations_StartDate",
                table: "SessionConfigurations");

            migrationBuilder.DropIndex(
                name: "IX_PremaritalRegistrations_Email",
                table: "PremaritalRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_PremaritalRegistrations_PaymentStatus",
                table: "PremaritalRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_PremaritalRegistrations_SubmittedAt",
                table: "PremaritalRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_GeneralRegistrations_Email",
                table: "GeneralRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_GeneralRegistrations_PaymentStatus",
                table: "GeneralRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_GeneralRegistrations_SubmittedAt",
                table: "GeneralRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_ConfirmationRegistrations_ChurchName",
                table: "ConfirmationRegistrations");

            migrationBuilder.DropIndex(
                name: "IX_ConfirmationRegistrations_SubmittedDate",
                table: "ConfirmationRegistrations");
        }
    }
}
