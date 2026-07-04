using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Antiforgery;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");
        group.DisableAntiforgery();
        // Secure by default: only login is anonymous.
        group.RequireAuthorization();

        group.MapPost("/login", async (ApplicationDbContext db, IConfiguration config, AdminLoginDto dto) =>
        {
            var admin = await db.AdminUsers.FirstOrDefaultAsync(a => a.Username == dto.Username);
            if (admin == null || !BCrypt.Net.BCrypt.Verify(dto.Password, admin.PasswordHash))
            {
                return Results.Unauthorized();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = System.Text.Encoding.ASCII.GetBytes(config["JwtSettings:Key"] ?? throw new Exception("JWT key missing"));
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, admin.Username),
                    new Claim(ClaimTypes.Role, "Admin")
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = config["JwtSettings:Issuer"],
                Audience = config["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Results.Ok(new { token = tokenString, username = admin.Username });
        })
        .AllowAnonymous();

        group.MapPost("/update-password", [Authorize] async (ApplicationDbContext db, UpdatePasswordDto dto) =>
        {
            if (dto.NewPassword != dto.ConfirmPassword)
                return Results.BadRequest("Passwords do not match.");

            var admin = await db.AdminUsers.FirstOrDefaultAsync();
            if (admin == null)
                return Results.NotFound("Admin not found.");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, admin.PasswordHash))
                return Results.Unauthorized();

            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Password updated successfully" });
        });
    }
}


