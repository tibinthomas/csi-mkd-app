using csi_mkd_premarital_app_BE.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults (telemetry, health checks, service discovery, resilience)
builder.AddServiceDefaults();

// Configure services
ServiceConfiguration.ConfigureServices(builder);

var app = builder.Build();

// Configure middleware pipeline
MiddlewareConfiguration.ConfigureMiddleware(app);

// Map endpoints
EndpointConfiguration.MapEndpoints(app);

// Configure startup tasks
StartupConfiguration.ConfigureStartupTasks(app);

app.Run();
