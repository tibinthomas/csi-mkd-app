using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Abstractions;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using CsiMkdFunctions;
using CsiMkdFunctions.Data;
using CsiMkdFunctions.Repositories;
using CsiMkdFunctions.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults(builder =>
    {
        builder.UseDefaultWorkerMiddleware();
    })
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // Add CORS
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            });
        });

        // Add configuration
        var configuration = context.Configuration;

        // Add Entity Framework with optimizations
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
                npgsqlOptions.CommandTimeout(30);
            });
            options.EnableSensitiveDataLogging(false);
            options.EnableServiceProviderCaching();
            options.EnableDetailedErrors(false);
        });

        // Add repositories and services
        services.AddScoped<ISessionConfigRepository, SessionConfigRepository>();
        services.AddScoped<ISessionConfigService, SessionConfigService>();

        // Add OpenAPI configuration
        services.AddSingleton<IOpenApiConfigurationOptions, CsiMkdFunctions.OpenApiConfigurationOptions>();
    })
    .Build();

host.Run();