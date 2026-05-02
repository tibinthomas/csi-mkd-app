using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CsiMkdFunctions.Models
{
    public class PremaritalOutsideKeralaDocument
    {
        [Key]
        [ForeignKey(nameof(PremaritalOutsideKeralaRegistration))]
        public Guid RegistrationId { get; set; }

        public string? VicarLetterUrl { get; set; }

        public PremaritalOutsideKeralaRegistration? PremaritalOutsideKeralaRegistration { get; set; }
    }
}
