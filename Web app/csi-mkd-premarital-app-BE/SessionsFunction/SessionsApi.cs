using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using SessionsFunction.DTOs;
using SessionsFunction.Services;
using System.Net;
using System.Text.Json;

namespace SessionsFunction
{
    public class SessionsApi
    {
        private readonly ILogger<SessionsApi> _logger;
        private readonly ISessionConfigService _sessionConfigService;

        public SessionsApi(ILogger<SessionsApi> logger, ISessionConfigService sessionConfigService)
        {
            _logger = logger;
            _sessionConfigService = sessionConfigService;
        }

        [Function("GetAllSessions")]
        [OpenApiOperation(operationId: "GetAllSessions", tags: new[] { "Sessions" }, Summary = "Get all sessions", Description = "Retrieves all available counseling sessions")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<SessionConfigurationDto>), Summary = "Success", Description = "Returns list of all sessions")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Summary = "Error", Description = "Internal server error")]
        public async Task<HttpResponseData> GetAllSessions(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sessions")] HttpRequestData req)
        {
            _logger.LogInformation("Getting all sessions");

            try
            {
                var sessions = await _sessionConfigService.GetAllSessions();
                
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json; charset=utf-8");
                
                await response.WriteStringAsync(JsonSerializer.Serialize(sessions, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }));
                
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting all sessions");
                
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = "Internal server error" }));
                return errorResponse;
            }
        }

        [Function("GetSessionsByYear")]
        [OpenApiOperation(operationId: "GetSessionsByYear", tags: new[] { "Sessions" }, Summary = "Get sessions by year", Description = "Retrieves counseling sessions for a specific year")]
        [OpenApiParameter(name: "year", In = ParameterLocation.Path, Required = true, Type = typeof(int), Summary = "Year", Description = "The year to filter sessions by")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<SessionConfigurationDto>), Summary = "Success", Description = "Returns list of sessions for the specified year")]
        [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(object), Summary = "Error", Description = "Internal server error")]
        public async Task<HttpResponseData> GetSessionsByYear(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "sessions/{year:int}")] HttpRequestData req,
            int year)
        {
            _logger.LogInformation("Getting sessions for year {Year}", year);

            try
            {
                var sessions = await _sessionConfigService.GetSessionsByYear(year);
                
                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json; charset=utf-8");
                
                await response.WriteStringAsync(JsonSerializer.Serialize(sessions, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                }));
                
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting sessions for year {Year}", year);
                
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = "Internal server error" }));
                return errorResponse;
            }
        }
    }
}