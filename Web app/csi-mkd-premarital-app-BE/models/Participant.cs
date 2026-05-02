
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

[Index(nameof(Id))]
[Index(nameof(ConfirmationRegistrationId))]
public class Participant
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100)]
    public required string Name { get; set; }

    [Required(ErrorMessage = "Age is required.")]
    [Range(1, 120, ErrorMessage = "Age must be between 1 and 120.")]
    public int Age { get; set; }

    [ForeignKey("ConfirmationRegistration")]
    public Guid ConfirmationRegistrationId { get; set; }

    [JsonIgnore]
    public ConfirmationRegistration? ConfirmationRegistration { get; set; }

    [Required]
    public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;


}
