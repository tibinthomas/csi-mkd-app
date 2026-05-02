using System.ComponentModel.DataAnnotations;

namespace CsiMkdFunctions.Models
{
    public class PremaritalOutsideKeralaRegistration
    {
        [Key]
        public Guid Id { get; set; }

        public DateTimeOffset SessionEndDate { get; set; }

        public PremaritalOutsideKeralaDocument? PremaritalOutsideKeralaDocument { get; set; }
    }
}
