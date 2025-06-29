using System.Text;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: "LocalCorsPolicy",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod();
        }
    );

    options.AddPolicy(
        "AllowFrontend",
        policy =>
        {
            policy
                .WithOrigins("https://gray-wave-0441f1a00.2.azurestaticapps.net")
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "My API", Version = "v1" });
});

builder.Services.AddScoped<AuditSaveChangesInterceptor>();

builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.AddInterceptors(serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>());

}
);

// AdminUser User Authentication
// Access configuration here
var configuration = builder.Configuration;

// JWT Setup
var key = Encoding.UTF8.GetBytes(configuration["JwtSettings:Key"]!);
if (string.IsNullOrEmpty(configuration["JwtSettings:Key"]))
{
    throw new Exception("JWT key is not configured in appsettings.json");
}
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = configuration["JwtSettings:Issuer"],
        ValidAudience = configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("LocalCorsPolicy");
app.UseCors("AllowFrontend");
app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CSI MKD API V1");
        c.RoutePrefix = "swagger";
    });
}

// Seeding Admin user

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    if (!db.AdminUsers.Any())
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("admin123"); // Replace with a strong password
        db.AdminUsers.Add(new AdminUser
        {
            Username = "admin",
            PasswordHash = passwordHash
        });

        db.SaveChanges();
    }
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.MapControllers();

app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => "Hi from Teena").WithOpenApi();

app.Run();
