using System.Text;
using AspNetCoreRateLimit;
using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Repositories;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace csi_mkd_premarital_app_BE.Configuration;

public static class ServiceConfiguration
{
    public static void ConfigureServices(WebApplicationBuilder builder)
    {
        // Core services
        builder.Services.AddOptions();
        builder.Services.AddMemoryCache();
        builder.Services.AddHttpClient();

        // Configure rate limiting
        ConfigureRateLimiting(builder);

        // Configure output caching
        ConfigureOutputCaching(builder);

        // Configure JSON options
        ConfigureJsonOptions(builder);
        
        // Optimize JSON serialization for production
        if (!builder.Environment.IsDevelopment())
        {
            builder.Services.ConfigureHttpJsonOptions(options =>
            {
                options.SerializerOptions.PropertyNamingPolicy = null;
                options.SerializerOptions.WriteIndented = false; // Faster in production
            });
        }

        // Configure Swagger (development only)
        if (builder.Environment.IsDevelopment())
        {
            ConfigureSwagger(builder);
        }

        // Configure CORS
        ConfigureCors(builder);

        // Configure database
        ConfigureDatabase(builder);

        // Configure Cosmos DB
        ConfigureCosmosDb(builder);

        // Register application services
        RegisterApplicationServices(builder);

        // Configure JWT authentication
        ConfigureJwtAuthentication(builder);

        // Configure authorization and antiforgery
        builder.Services.AddAuthorization();
        builder.Services.AddAntiforgery();
    }

    private static void ConfigureRateLimiting(WebApplicationBuilder builder)
    {
        // IP rate limiting
        builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
        builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
        builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();

        // Client rate limiting
        builder.Services.Configure<ClientRateLimitOptions>(builder.Configuration.GetSection("ClientRateLimiting"));
        builder.Services.AddSingleton<IClientPolicyStore, MemoryCacheClientPolicyStore>();

        builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
        builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
        builder.Services.AddInMemoryRateLimiting();
    }

    private static void ConfigureOutputCaching(WebApplicationBuilder builder)
    {
        builder.Services.AddOutputCache(options =>
        {
            options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromMinutes(10)));
            options.AddPolicy("Expire2m", builder => builder.Expire(TimeSpan.FromMinutes(2)));
            options.AddPolicy("Expire10s", builder => builder.Expire(TimeSpan.FromSeconds(10)));
            options.AddPolicy("NoCache", builder => builder.NoCache());
        });
    }

    private static void ConfigureJsonOptions(WebApplicationBuilder builder)
    {
        builder.Services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.PropertyNamingPolicy = null;
            options.SerializerOptions.WriteIndented = true;
        });
    }

    private static void ConfigureSwagger(WebApplicationBuilder builder)
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

    private static void ConfigureCors(WebApplicationBuilder builder)
    {
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
    }

    private static void ConfigureDatabase(WebApplicationBuilder builder)
    {
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

            // Enable compiled models for faster startup (EF Core 9 approach)
            options.UseModel(ApplicationDbContextModel.Instance);

            // Performance optimizations
            options.EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
            options.EnableDetailedErrors(builder.Environment.IsDevelopment());
            
            // Disable change tracking in production for faster startup
            if (!builder.Environment.IsDevelopment())
            {
                options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
            }

            // Add EF Core interceptor(s)
            options.AddInterceptors(serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>());
        }, poolSize: 128); // Reduced from 256 for consumption plan
    }

    private static void ConfigureCosmosDb(WebApplicationBuilder builder)
    {
        var cosmosConnectionString = builder.Configuration.GetConnectionString("CosmosConnection");
        var cosmosDbConfig = builder.Configuration.GetSection("CosmosDb");
        
        if (!string.IsNullOrEmpty(cosmosConnectionString))
        {
            builder.Services.AddDbContext<CosmosDbContext>(options =>
            {
                options.UseCosmos(
                    connectionString: cosmosConnectionString,
                    databaseName: cosmosDbConfig["DatabaseName"] ?? "csi-mkd-premarital-db",
                    cosmosOptionsAction: cosmosOptions =>
                    {
                        // Configure Cosmos DB specific options
                        cosmosOptions.ConnectionMode(Microsoft.Azure.Cosmos.ConnectionMode.Direct);
                        cosmosOptions.MaxRequestsPerTcpConnection(16);
                        cosmosOptions.MaxTcpConnectionsPerEndpoint(32);
                        
                        // Configure region and consistency
                        cosmosOptions.Region(Microsoft.Azure.Cosmos.Regions.EastUS);
                        
                        // Configure request timeout
                        cosmosOptions.RequestTimeout(TimeSpan.FromSeconds(30));

                        // Content response on write (disable for better performance in production)
                        var enableContentResponse = cosmosDbConfig.GetValue<bool>("EnableContentResponseOnWrite", false);
                        if (!enableContentResponse)
                        {
                            cosmosOptions.ContentResponseOnWriteEnabled(false);
                        }
                    });

                // Enable sensitive data logging only in development
                options.EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
                options.EnableDetailedErrors(builder.Environment.IsDevelopment());
            });
        }
    }

    private static void RegisterApplicationServices(WebApplicationBuilder builder)
    {
        // Interceptors
        builder.Services.AddSingleton<AuditSaveChangesInterceptor>();

        // Core services
        builder.Services.AddScoped<EmailService>();
        builder.Services.AddScoped<BlobStorageService>();

        // Repository services
        builder.Services.AddScoped<IPremaritalRegisterRepository, PremaritalRegisterRepository>();
        builder.Services.AddScoped<IGeneralRegisterRepository, GeneralRegisterRepository>();
        builder.Services.AddScoped<IConfirmationRegisterRepository, ConfirmationRegisterRepository>();
        builder.Services.AddScoped<ISessionConfigRepository, SessionConfigRepository>();
        builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();

        // Business logic services
        builder.Services.AddScoped<IPremaritalRegisterService, PremaritalRegisterService>();
        builder.Services.AddScoped<IGeneralRegisterService, GeneralRegisterService>();
        builder.Services.AddScoped<IConfirmationRegisterService, ConfirmationRegisterService>();
        builder.Services.AddScoped<ISessionConfigService, SessionConfigService>();
        builder.Services.AddScoped<IFeedbackService, FeedbackService>();
        builder.Services.AddScoped<IRecaptchaService, RecaptchaService>();
        builder.Services.AddScoped<ICacheInvalidationService, CacheInvalidationService>();
        builder.Services.AddScoped<ICacheHealthService, CacheHealthService>();
    }

    private static void ConfigureJwtAuthentication(WebApplicationBuilder builder)
    {
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
    }
}
