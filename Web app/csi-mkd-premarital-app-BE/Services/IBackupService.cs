namespace csi_mkd_premarital_app_BE.Services;

public interface IBackupService
{
    /// <summary>
    /// Triggers a manual backup of the Supabase database to Azure Blob Storage
    /// </summary>
    /// <returns>The filename of the created backup</returns>
    Task<string> TriggerBackupAsync();

    /// <summary>
    /// Downloads the most recent backup file from Azure Blob Storage
    /// </summary>
    /// <returns>Tuple of (stream, filename) or null if no backups exist</returns>
    Task<(Stream stream, string filename)?> DownloadLatestBackupAsync();
}
