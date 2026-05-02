# Configuration Structure

This directory contains the configuration classes that organize the application setup into logical, maintainable components.

## File Organization

### 1. `ServiceConfiguration.cs`

Handles all service registrations and configurations including:

- Core services (Options, MemoryCache, HttpClient)
- Rate limiting configuration
- Output caching policies
- JSON serialization options
- Swagger/OpenAPI setup
- CORS policy configuration
- Database context configuration
- Application service registration
- JWT authentication setup

### 2. `MiddlewareConfiguration.cs`

Manages the middleware pipeline configuration:

- Development-specific middleware (Swagger, HTTPS)
- Custom middleware (Rate limiting, cache invalidation)
- Standard middleware (Static files, CORS, authentication, etc.)

### 3. `EndpointConfiguration.cs`

Handles endpoint mapping and routing:

- Default endpoints
- Health check endpoints
- Application-specific endpoints

### 4. `StartupConfiguration.cs`

Manages startup tasks and warmup operations:

- EF Core model warmup
- Database connectivity verification

## Benefits of This Structure

### **Separation of Concerns**

- Each configuration class has a single responsibility
- Easy to locate and modify specific configurations
- Clear boundaries between different aspects of setup

### **Maintainability**

- Easier to test individual configuration components
- Simpler to debug configuration issues
- Better code organization and readability

### **Scalability**

- Easy to add new configuration classes for new features
- Simple to extend existing configurations
- Clear structure for team collaboration

### **Reusability**

- Configuration methods can be reused across different environments
- Easy to create environment-specific configurations
- Simple to share common configuration patterns

## Usage

The main `Program.cs` file now simply calls these configuration classes:

```csharp
// Configure services
ServiceConfiguration.ConfigureServices(builder);

// Configure middleware pipeline
MiddlewareConfiguration.ConfigureMiddleware(app);

// Map endpoints
EndpointConfiguration.MapEndpoints(app);

// Configure startup tasks
StartupConfiguration.ConfigureStartupTasks(app);
```

## Adding New Configuration

To add new configuration:

1. Create a new configuration class in this directory
2. Follow the naming convention: `[Feature]Configuration.cs`
3. Use static methods for configuration
4. Call the configuration method from `Program.cs`

Example:

```csharp
// NewFeatureConfiguration.cs
public static class NewFeatureConfiguration
{
    public static void ConfigureNewFeature(WebApplicationBuilder builder)
    {
        // Configuration logic here
    }
}

// In Program.cs
NewFeatureConfiguration.ConfigureNewFeature(builder);
```

## Best Practices

- Keep configuration methods focused and single-purpose
- Use descriptive method names
- Group related configurations together
- Maintain consistent naming conventions
- Add appropriate comments for complex configurations
- Consider environment-specific configurations when needed
