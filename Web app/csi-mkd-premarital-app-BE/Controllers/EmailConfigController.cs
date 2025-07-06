
using csi_mkd_premarital_app_BE.Models;
using Microsoft.AspNetCore.Mvc;
using csi_mkd_premarital_app_BE.Data;

namespace csi_mkd_premarital_app_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailConfigController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public EmailConfigController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var config = _db.EmailConfigs.FirstOrDefault();
            if (config == null) return NotFound();
            return Ok(config);
        }

        [HttpPost]
        public IActionResult SaveOrUpdate([FromBody] EmailConfig input)
        {
            var existing = _db.EmailConfigs.FirstOrDefault();

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

            _db.SaveChanges();
            return Ok("Email config saved successfully.");
        }
    }

}
