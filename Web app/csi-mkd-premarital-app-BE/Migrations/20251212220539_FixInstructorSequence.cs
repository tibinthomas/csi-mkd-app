using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace csi_mkd_premarital_app_BE.Migrations
{
    /// <inheritdoc />
    public partial class FixInstructorSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Reset the sequence for the Instructors table to the max ID + 1
            // This fixes the duplicate key error when inserting new instructors
            migrationBuilder.Sql(@"
                SELECT setval(
                    pg_get_serial_sequence('public.""Instructors""', 'Id'), 
                    COALESCE((SELECT MAX(""Id"") FROM public.""Instructors""), 1), 
                    true
                );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No action needed on rollback - sequence will remain at current value
        }
    }
}
