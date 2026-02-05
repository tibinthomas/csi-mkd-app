using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace csi_mkd_premarital_app_BE.Models
{
    public class ParticipantOutsideKerala
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, StringLength(100)]
        public required string Name { get; set; }

        [ForeignKey("PremaritalOutsideKeralaRegistration")]
        public Guid RegistrationId { get; set; }

        [JsonIgnore]
        public PremaritalOutsideKeralaRegistration? PremaritalOutsideKeralaRegistration { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}
