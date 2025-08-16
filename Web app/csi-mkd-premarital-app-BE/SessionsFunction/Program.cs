using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Abstractions;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SessionsFunction;
using SessionsFunction.Data;
using SessionsFunction.Repositories;
using SessionsFunction.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults(builder =>
    {
        builder.UseDefaultWorkerMiddleware();
    })
    .ConfigureServices((context, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        // Add configuration
        var configuration = context.Configuration;
        
        // Add Entity Framework
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Add repositories and services
        services.AddScoped<ISessionConfigRepository, SessionConfigRepository>();
        services.AddScoped<ISessionConfigService, SessionConfigService>();

        // Add OpenAPI configuration
        services.AddSingleton<IOpenApiConfigurationOptions, SessionsFunction.OpenApiConfigurationOptions>();
    })
    .Build();

host.Run();