namespace csi_mkd_premarital_app_BE.Models
{
    public class ServiceResponse<T>
    {
        public T? Data { get; set; }
        public int StatusCode { get; set; }
        public string? Message { get; set; }
    }
}
