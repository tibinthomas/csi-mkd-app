using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using csi_mkd_premarital_app_BE.DTOs;

public class UpdateConfirmationRegisterDto
{
    [Range(1, 300)]
    public int? ChurchId { get; set; }
    public DateTime ConfirmationDate { get; set; }
    public DateTime CounsellingDate { get; set; }
    public List<ParticipantDto> Participants { get; set; } = new();
    public List<Guid> DeletedParticipantIds { get; set; } = new();

    /// <summary>
    /// When set, replaces (or creates) the registration's vicar letter document.
    /// Null/empty leaves the existing letter untouched.
    /// </summary>
    public string? VicarLetterUrl { get; set; }
}
