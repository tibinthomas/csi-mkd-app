var builder = DistributedApplication.CreateBuilder(args);

// Add the main API project
var mainApi = builder.AddProject("main-api", "../csi-mkd-premarital-app-BE.csproj")
    .WithExternalHttpEndpoints();

// Add the Sessions Function project  
var sessionsFunction = builder.AddProject("sessions-function", "../SessionsFunction/SessionsFunction.csproj")
    .WithExternalHttpEndpoints();

var app = builder.Build();
app.Run();
