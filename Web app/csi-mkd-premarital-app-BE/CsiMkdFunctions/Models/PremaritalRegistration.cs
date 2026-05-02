using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CsiMkdFunctions.Models
{
    public class PremaritalRegistration
    {
        [Key]
        public Guid Id { get; set; }

        [ForeignKey(nameof(SessionConfiguration))]
        public int SessionId { get; set; }

        public SessionConfiguration? SessionConfiguration { get; set; }

        public PremaritalDocument? PremaritalDocument { get; set; }
    }
}
