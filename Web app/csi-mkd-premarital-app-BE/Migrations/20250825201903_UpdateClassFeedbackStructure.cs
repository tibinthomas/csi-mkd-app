using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class UpdateClassFeedbackStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ClassFeedbacks_PremaritalRegistrations_PremaritalRegistrati~",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "ClassId",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "Comments",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "EngagementRating",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "OrganizationRating",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "QualityRating",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "RelevanceRating",
                table: "ClassFeedbacks");

            migrationBuilder.RenameColumn(
                name: "Valuable",
                table: "ClassFeedbacks",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "SubmittedAt",
                table: "ClassFeedbacks",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "Improvements",
                table: "ClassFeedbacks",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "ClassFeedbacks",
                newName: "CreatedAt");

            migrationBuilder.AlterColumn<Guid>(
                name: "PremaritalRegistrationId",
                table: "ClassFeedbacks",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FeedbacksJson",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "ClassFeedbacks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

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

            migrationBuilder.DropColumn(
                name: "Email",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "FeedbacksJson",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "ClassFeedbacks");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "ClassFeedbacks");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "ClassFeedbacks",
                newName: "SubmittedAt");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "ClassFeedbacks",
                newName: "Valuable");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "ClassFeedbacks",
                newName: "Improvements");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "ClassFeedbacks",
                newName: "Date");

            migrationBuilder.AlterColumn<Guid>(
                name: "PremaritalRegistrationId",
                table: "ClassFeedbacks",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<int>(
                name: "ClassId",
                table: "ClassFeedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Comments",
                table: "ClassFeedbacks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EngagementRating",
                table: "ClassFeedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OrganizationRating",
                table: "ClassFeedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "QualityRating",
                table: "ClassFeedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RelevanceRating",
                table: "ClassFeedbacks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_ClassFeedbacks_PremaritalRegistrations_PremaritalRegistrati~",
                table: "ClassFeedbacks",
                column: "PremaritalRegistrationId",
                principalTable: "PremaritalRegistrations",
                principalColumn: "Id");
        }
    }
}
