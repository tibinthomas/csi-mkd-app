using System.Text;
using AspNetCoreRateLimit;
using csi_mkd_premarital_app_BE.Data;
using Microsoft.AspNetCore.Antiforgery;
using csi_mkd_premarital_app_BE.Middleware;
using csi_mkd_premarital_app_BE.Repositories;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using csi_mkd_premarital_app_BE.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults (telemetry, health checks, service discovery, resilience)
builder.AddServiceDefaults();

// Add services to the container
builder.Services.AddOptions();
builder.Services.AddMemoryCache();

// Configure IP rate limiting
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();

// Configure client rate limiting
builder.Services.Configure<ClientRateLimitOptions>(builder.Configuration.GetSection("ClientRateLimiting"));
builder.Services.AddSingleton<IClientPolicyStore, MemoryCacheClientPolicyStore>();

builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
builder.Services.AddInMemoryRateLimiting();

builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromMinutes(10)));
    options.AddPolicy("Expire2m", builder => builder.Expire(TimeSpan.FromMinutes(2)));
    options.AddPolicy("Expire10s", builder => builder.Expire(TimeSpan.FromSeconds(10)));
    options.AddPolicy("NoCache", builder => builder.NoCache());
});

// MVC controllers are not used anymore; switching to minimal APIs
// Keep JSON defaults aligned via System.Text.Json defaults when needed in minimal handlers
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
    options.SerializerOptions.WriteIndented = true;
});

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "CSI MKD API",
            Version = "v1",
            Description = "API for CSI MKD Premarital Counseling Application"
        });

        // Add JWT Authentication to Swagger
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
    });
}

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOrigins", policy =>
    {
        policy.WithOrigins(
                "https://csimkdcounselling.com",
                "http://localhost:4200",
                "https://gray-wave-0441f1a00.2.azurestaticapps.net"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("Content-Disposition");
    });
});

// Configure Database with DbContext pooling
builder.Services.AddDbContextPool<ApplicationDbContext>((serviceProvider, options) =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
    });

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging()
               .EnableDetailedErrors();
    }

    // Add EF Core interceptor(s)
    options.AddInterceptors(serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>());
}, poolSize: 256);

// Register Services
builder.Services.AddSingleton<AuditSaveChangesInterceptor>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<IPremaritalRegisterService, PremaritalRegisterService>();
builder.Services.AddScoped<IPremaritalRegisterRepository, PremaritalRegisterRepository>();
builder.Services.AddScoped<ISessionConfigService, SessionConfigService>();
builder.Services.AddScoped<ISessionConfigRepository, SessionConfigRepository>();
builder.Services.AddScoped<BlobStorageService>();
builder.Services.AddScoped<IGeneralRegisterService, GeneralRegisterService>();
builder.Services.AddScoped<IGeneralRegisterRepository, GeneralRegisterRepository>();
builder.Services.AddScoped<IConfirmationRegisterService, ConfirmationRegisterService>();
builder.Services.AddScoped<IConfirmationRegisterRepository, ConfirmationRegisterRepository>();
builder.Services.AddHttpClient(); // Required for HttpClientFactory
builder.Services.AddScoped<IRecaptchaService, RecaptchaService>();
builder.Services.AddScoped<ICacheInvalidationService, CacheInvalidationService>();
builder.Services.AddScoped<ICacheHealthService, CacheHealthService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]
    ?? throw new InvalidOperationException("JWT key is not configured"));

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
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Add antiforgery services
builder.Services.AddAntiforgery();

var app = builder.Build();

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CSI MKD API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseMiddleware<RateLimitingMiddleware>();
app.UseIpRateLimiting();
app.UseClientRateLimiting();

app.UseHttpsRedirection();
app.UseStaticFiles();
// Add conditional GET handling for static files (ETag/Last-Modified are on by default). Ensure If-None-Match/If-Modified-Since respected.
// StaticFileMiddleware already sets ETag/Last-Modified; no extra code needed.
app.UseCors("AllowedOrigins");

app.UseOutputCache();
app.UseCacheInvalidation();

app.UseAuthentication();
app.UseAuthorization();

app.UseAntiforgery();

app.MapDefaultEndpoints();

// Map minimal API endpoints
app.MapAuthEndpoints();
app.MapGeneralRegisterEndpoints();
app.MapPremaritalRegisterEndpoints();
app.MapConfirmationRegisterEndpoints();
app.MapSessionConfigEndpoints();
app.MapEmailConfigEndpoints();
app.MapFeedbackEndpoints();
app.MapAzureUploadEndpoints();
app.MapCacheManagementEndpoints();

// Add health check endpoint
app.MapGet("/health", () => Results.Ok("Healthy"));

app.Run();
