using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;
[Index(nameof(Id))]
[Index(nameof(ChurchId))]
[Index(nameof(SubmittedDate))]
public class ConfirmationRegistration
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Range(1, 300)]
    public int? ChurchId { get; set; }

    [StringLength(100)]
    public string? PriestName { get; set; }

    [Required(ErrorMessage = "Confirmation date is required.")]
    [DataType(DataType.Date)]
    public DateTime ConfirmationDate { get; set; }

    [Required(ErrorMessage = "Counselling date is required.")]
    [DataType(DataType.Date)]
    public DateTime CounsellingDate { get; set; }

    [Required]
    public List<Participant> Participants { get; set; } = new();

    [Required]
    public ConfirmationDocument? ConfirmationDocument { get; set; }

    public bool Consent { get; set; }

    [Required]
    public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;
}
