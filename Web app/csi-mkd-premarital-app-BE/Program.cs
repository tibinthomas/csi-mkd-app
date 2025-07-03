using System.Text;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "CSI MKD API", Version = "v1" });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });

    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://gray-wave-0441f1a00.2.azurestaticapps.net")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add DB context with interceptor
builder.Services.AddScoped<AuditSaveChangesInterceptor>();
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.AddInterceptors(serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>());
});

// JWT Authentication
var configuration = builder.Configuration;
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
builder.Services.AddScoped<EmailService>();

var app = builder.Build();

// Use HTTPS
app.UseHttpsRedirection();

// Use static files
app.UseStaticFiles();

// CORS policy based on environment
if (app.Environment.IsDevelopment())
{
    app.UseCors("LocalCorsPolicy");
}
else
{
    app.UseCors("AllowFrontend");
}

// Use Swagger only in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CSI MKD API V1");
        c.RoutePrefix = "swagger";
    });
}

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Routing
app.MapControllers();

// Test endpoint
app.MapGet("/", () => "Hi from Teena").WithOpenApi();

// DB Migration & Seeding
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    if (!db.AdminUsers.Any())
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("admin123"); // Replace with secure password
        db.AdminUsers.Add(new AdminUser
        {
            Username = "admin",
            PasswordHash = passwordHash
        });

        db.SaveChanges();
    }
}

app.Run();
