using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Configurations;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.OpenApi.Models;

namespace CsiMkdFunctions
{
    public class OpenApiConfigurationOptions : DefaultOpenApiConfigurationOptions
    {
        public override OpenApiInfo Info { get; set; } = new()
        {
            Version = "1.0.0",
            Title = "CSI MKD Sessions API",
            Description = "API for managing counseling sessions",
            Contact = new OpenApiContact
            {
                Name = "CSI MKD Premarital Counseling",
                Email = "support@csimkdcounselling.com"
            }
        };

        public override OpenApiVersionType OpenApiVersion { get; set; } = OpenApiVersionType.V3;
    }
}