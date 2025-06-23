// Models/Registration.cs
using System;
namespace csi_mkd_premarital_app_BE.Models;

public class Registration
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string Church { get; set; }
    public string PartnerName { get; set; }
    public string Education { get; set; }

    public string PhotoFileName { get; set; }
    public string PastorLetterFileName { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
