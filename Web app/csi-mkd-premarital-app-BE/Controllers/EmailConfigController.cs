
using csi_mkd_premarital_app_BE.Models;
using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.Data;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace csi_mkd_premarital_app_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailConfigController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IOutputCacheStore _cache;

        public EmailConfigController(ApplicationDbContext db, IOutputCacheStore cache)
        {
            _db = db;
            _cache = cache;
        }

        [HttpGet]
        [OutputCache(PolicyName = "Expire2m", Tags = ["email-config"])]
        public async Task<IActionResult> Get()
        {
            var config = await _db.EmailConfigs.AsNoTracking().FirstOrDefaultAsync();
            if (config == null) return NotFound();
            var version = $"{config.SenderEmail}:{config.EmailSubject}:{(config.EmailBodyTemplate?.Length ?? 0)}";
            var etag = GenerateETag(version);
            if (Request.Headers.IfNoneMatch == etag)
                return StatusCode(304);
            Response.Headers.ETag = etag;
            return Ok(config);
        }

        [HttpPost]
        public async Task<IActionResult> SaveOrUpdate([FromBody] EmailConfig input)
        {
            var existing = await _db.EmailConfigs.FirstOrDefaultAsync();

            if (existing != null)
            {
                existing.SenderEmail = input.SenderEmail;
                existing.SenderPassword = input.SenderPassword;
                existing.EmailSubject = input.EmailSubject;
                existing.EmailBodyTemplate = input.EmailBodyTemplate;
            }
            else
            {
                _db.EmailConfigs.Add(input);
            }

            await _db.SaveChangesAsync();
            await _cache.EvictByTagAsync("email-config", default);
            return Ok("Email config saved successfully.");
        }

        private static string GenerateETag(string input)
        {
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = SHA256.HashData(bytes);
            var base64 = Convert.ToBase64String(hash);
            return $"\"{base64}\"";
        }
    }

}
