var builder = DistributedApplication.CreateBuilder(args);

// Reference the API project using its assembly name as generated in Projects.g.cs
builder.AddProject("csi-mkd-premarital-app-BE", "../csi-mkd-premarital-app-BE.csproj")
       .WithExternalHttpEndpoints();

builder.Build().Run();
