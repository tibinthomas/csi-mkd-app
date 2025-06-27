public class GeneralRegisterDto
{
    public required string Name { get; set; }
    public required string FatherName { get; set; }
    public required string Address { get; set; }
    public required string Sex { get; set; }
    public int Age { get; set; }
    public required string Education { get; set; }
    public required string Occupation { get; set; }
    public string? ChurchName { get; set; }
    public required string Phone { get; set; }
    public required string Email { get; set; }
    public required string MaritalStatus { get; set; }
    public required string SessionType { get; set; }
    public bool Declaration { get; set; }
    public IFormFile? Photo { get; set; }
}
