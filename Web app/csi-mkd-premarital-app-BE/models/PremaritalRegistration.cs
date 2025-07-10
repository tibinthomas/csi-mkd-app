using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Models
{
    public class PremaritalRegistration
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string FatherName { get; set; }
        public required string Address { get; set; }
        public required string Sex { get; set; }
        public required int Age { get; set; }
        public required string Education { get; set; }
        public required string Occupation { get; set; }
        public required string ChurchName { get; set; }
        public string? FianceName { get; set; }
        public DateTime? DateOfMarriage { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public required string Days { get; set; }
        public required string? ChurchActivitiesJson { get; set; }
        public required bool Declaration { get; set; }
        public required string PhotoFilePath { get; set; }
        public required string VicarLetterFilePath { get; set; }

        [ForeignKey("SessionConfiguration")]
        public required int SessionId { get; set; }

        public SessionConfiguration? SessionConfiguration { get; set; }
        public bool PaymentStatus { get; set; } // true = Paid, false = Unpaid

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // [Timestamp]
        // public byte[] RowVersion { get; set; } = default!;
    }
}