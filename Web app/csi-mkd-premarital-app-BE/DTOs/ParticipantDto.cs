namespace csi_mkd_premarital_app_BE.DTOs;

public class ParticipantDto
{
    public Guid? Id { get; set; }
    public required string Name { get; set; }
    public int Age { get; set; }
}

public class CheckEmailResponseDto
{
    public bool Exists { get; set; }
    public Guid? UserId { get; set; }
}
