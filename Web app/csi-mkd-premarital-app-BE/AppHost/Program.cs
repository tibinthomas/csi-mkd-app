var builder = DistributedApplication.CreateBuilder(args);

// Add the main API project
var mainApi = builder.AddProject("main-api", "../csi-mkd-premarital-app-BE.csproj")
    .WithExternalHttpEndpoints();

// Add the CSI MKD Functions project  
var csiMkdFunctions = builder.AddProject("csi-mkd-functions", "../CsiMkdFunctions/CsiMkdFunctions.csproj")
    .WithExternalHttpEndpoints();

var app = builder.Build();
app.Run();
