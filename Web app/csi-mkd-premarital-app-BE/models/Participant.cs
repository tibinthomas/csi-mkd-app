
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Participant
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100)]
    public required string Name { get; set; }

    [Required(ErrorMessage = "Age is required.")]
    [Range(1, 120, ErrorMessage = "Age must be between 1 and 120.")]
    public int Age { get; set; }

    [ForeignKey("ConfirmationRegistration")]
    public int ConfirmationRegistrationId { get; set; }

    public ConfirmationRegistration? ConfirmationRegistration { get; set; }

    [Required]
    public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;


}
