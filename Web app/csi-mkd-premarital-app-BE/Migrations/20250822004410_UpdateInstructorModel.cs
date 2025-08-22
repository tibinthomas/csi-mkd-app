using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class UpdateInstructorModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Qualification",
                table: "Instructors",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                comment: "Professional qualifications and credentials",
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Instructors",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                comment: "Full name of the instructor",
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "LastModifiedBy",
                table: "Instructors",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                comment: "User who last modified the instructor record",
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Instructors",
                type: "timestamp with time zone",
                nullable: true,
                comment: "Timestamp when the instructor record was last modified",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "Instructors",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                comment: "User who created the instructor record",
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Instructors",
                type: "timestamp with time zone",
                nullable: false,
                comment: "Timestamp when the instructor record was created",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.CreateIndex(
                name: "IX_Instructors_CreatedAt",
                table: "Instructors",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Instructors_Name",
                table: "Instructors",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Instructors_CreatedAt",
                table: "Instructors");

            migrationBuilder.DropIndex(
                name: "IX_Instructors_Name",
                table: "Instructors");

            migrationBuilder.AlterColumn<string>(
                name: "Qualification",
                table: "Instructors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldComment: "Professional qualifications and credentials");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Instructors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldComment: "Full name of the instructor");

            migrationBuilder.AlterColumn<string>(
                name: "LastModifiedBy",
                table: "Instructors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true,
                oldComment: "User who last modified the instructor record");

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Instructors",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true,
                oldComment: "Timestamp when the instructor record was last modified");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "Instructors",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true,
                oldComment: "User who created the instructor record");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Instructors",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldComment: "Timestamp when the instructor record was created");
        }
    }
}
