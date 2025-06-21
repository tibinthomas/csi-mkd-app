using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csi_mkd_premarital_app_BE.Models;

public class Student
{
    [Key]
    public int StudentId { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; }

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; }

    public DateTime DateOfBirth { get; set; }

    [MaxLength(200)]
    public string Email { get; set; }
}
