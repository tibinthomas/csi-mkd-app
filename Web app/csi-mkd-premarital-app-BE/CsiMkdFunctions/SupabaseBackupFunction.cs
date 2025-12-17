using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CsiMkdFunctions;

public class SupabaseBackupFunction
{
    private readonly ILogger<SupabaseBackupFunction> _logger;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public SupabaseBackupFunction(
        ILogger<SupabaseBackupFunction> logger,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
    }

    [Function("SupabaseBackup")]
    public async Task Run([TimerTrigger("0 0 0,12 * * *")] TimerInfo myTimer)
    {
        _logger.LogInformation("Supabase backup timer triggered at: {Time}", DateTime.UtcNow);

        try
        {
            // Get the main app URL from configuration
            var mainAppUrl = _configuration["MainApp:BaseUrl"] 
                ?? "https://csi-mkd-premarital-app-be.azurewebsites.net";
            
            var backupEndpoint = $"{mainAppUrl}/api/backup/trigger";

            _logger.LogInformation("Calling main app backup endpoint: {Endpoint}", backupEndpoint);

            // Call the main app's backup endpoint
            var response = await _httpClient.PostAsync(backupEndpoint, null);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Backup completed successfully. Response: {Response}", content);
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Backup failed with status {StatusCode}. Error: {Error}", 
                    response.StatusCode, error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during scheduled backup");
            throw;
        }

        if (myTimer.ScheduleStatus is not null)
        {
            _logger.LogInformation("Next timer schedule at: {Next}", myTimer.ScheduleStatus.Next);
        }
    }
}
