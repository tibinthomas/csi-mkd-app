public class AdminUser
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public byte[] RowVersion { get; set; } = default!;

}
