using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace csi_mkd_premarital_app_BE.Controller;

[ApiController]
[Route("api/[controller]")]
public class AzureUploadController : ControllerBase
{
    private readonly BlobStorageService _blobService;

    public AzureUploadController(BlobStorageService blobService)
    {
        _blobService = blobService;
    }

    [HttpGet("generate-sas")]
    public async Task<IActionResult> GetSasUrl([FromQuery] string fileName, [FromQuery] string contentType)
    {
        var url = await _blobService.GetUploadSasUrlAsync(fileName, contentType);
        Console.WriteLine(url);
        return Ok(new { url });
    }
}
