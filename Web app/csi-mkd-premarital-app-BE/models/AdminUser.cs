using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class AdminUser
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    // [Timestamp]
    // [Column(TypeName = "bytea")]
    // public byte[] RowVersion { get; set; } = Array.Empty<byte>(); // Prevents null

}
