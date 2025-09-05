var builder = DistributedApplication.CreateBuilder(args);

// Add the main API project
var mainApi = builder.AddProject("main-api", "../csi-mkd-premarital-app-BE.csproj")
    .WithHttpEndpoint(port: 5177, name: "main-api-http")
    .WithExternalHttpEndpoints();

// Add the CSI MKD Functions project  
var csiMkdFunctions = builder.AddProject("csi-mkd-functions", "../CsiMkdFunctions/CsiMkdFunctions.csproj")
    .WithHttpEndpoint(port: 7071, name: "functions-http")
    .WithExternalHttpEndpoints();

var app = builder.Build();
app.Run();
