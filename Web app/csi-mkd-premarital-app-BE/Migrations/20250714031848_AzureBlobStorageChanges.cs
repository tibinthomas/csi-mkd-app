using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class AzureBlobStorageChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VicarLetterFilePath",
                table: "PremaritalRegistrations",
                newName: "VicarLetterUrl");

            migrationBuilder.RenameColumn(
                name: "PhotoFilePath",
                table: "PremaritalRegistrations",
                newName: "PhotoUrl");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VicarLetterUrl",
                table: "PremaritalRegistrations",
                newName: "VicarLetterFilePath");

            migrationBuilder.RenameColumn(
                name: "PhotoUrl",
                table: "PremaritalRegistrations",
                newName: "PhotoFilePath");
        }
    }
}
