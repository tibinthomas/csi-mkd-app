public class PremaritalRegisterResponseDto
{
    public int Id { get; set; }

    public required string Name { get; set; }
    public required string FatherName { get; set; }
    public required string Address { get; set; }
    public required string Sex { get; set; }

    public int Age { get; set; }

    public required string Education { get; set; }
    public required string Occupation { get; set; }
    public required string ChurchName { get; set; }

    public string? FianceName { get; set; }
    public DateTime? DateOfMarriage { get; set; }

    public required string Phone { get; set; }
    public required string Email { get; set; }

    public required string Days { get; set; }

    public bool? ChoirMember { get; set; }
    public bool? SsTeacher { get; set; }
    public bool? YouthFellowship { get; set; }

    public string? OtherChurchActivities { get; set; }
    public string? PhotoPath { get; set; }
    public string? VicarLetterPath { get; set; }

    public required string RowVersion { get; set; } // Base64 string
}
