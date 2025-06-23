// DTOs/RegistrationDto.cs
using Microsoft.AspNetCore.Http;

public class RegistrationDto
{
    public string Name { get; set; }
    public string Address { get; set; }
    public string Church { get; set; }
    public string PartnerName { get; set; }
    public string Education { get; set; }

    public IFormFile Photo { get; set; }
    public IFormFile PastorLetter { get; set; }
}
