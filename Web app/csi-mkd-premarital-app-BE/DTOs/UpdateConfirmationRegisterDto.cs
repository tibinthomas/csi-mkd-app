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
}
