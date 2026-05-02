using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CsiMkdFunctions.Models
{
    public class PremaritalDocument
    {
        [Key]
        [ForeignKey(nameof(PremaritalRegistration))]
        public Guid RegistrationId { get; set; }

        public string? PhotoUrl { get; set; }

        public string? VicarLetterUrl { get; set; }

        public PremaritalRegistration? PremaritalRegistration { get; set; }
    }
}
