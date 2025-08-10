using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using csi_mkd_premarital_app_BE.Utilities;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class ConfirmationRegisterEndpoints
{
    public static void MapConfirmationRegisterEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/confirmationregister");

        group.MapPost("/", async (IConfirmationRegisterService service, IRecaptchaService recaptcha, IOutputCacheStore cache, ConfirmationRegisterDto dto) =>
        {
            if (!await recaptcha.VerifyTokenAsync(dto.RecaptchaToken))
                return Results.BadRequest(new { Message = "Invalid reCAPTCHA token." });
            var result = await service.Register(dto);
            await cache.EvictByTagAsync("confirmation-regs", default);
            return Results.Json(result.Data, statusCode: result.StatusCode);
        });

        group.MapPost("/save-file-url", async (IConfirmationRegisterService service, IOutputCacheStore cache, ConfirmationDocumentDto dto) =>
        {
            var result = await service.SaveFiles(dto);
            await cache.EvictByTagAsync("confirmation-regs", default);
            return Results.Json(result.Data, statusCode: result.StatusCode);
        });

        group.MapGet("/filter", async (IConfirmationRegisterService service, HttpRequest req) =>
        {
            var filter = new ConfirmationRegisterFilterDto
            {
                Page = int.TryParse(req.Query["Page"], out var page) ? page : 1,
                PageSize = int.TryParse(req.Query["PageSize"], out var pageSize) ? pageSize : 10,
                Search = req.Query["Search"]
            };
            var data = await service.GetFilteredRegistrations(filter);
            var version = $"{filter.Page}:{filter.PageSize}:{filter.Search}";
            var etag = ETagHelper.GenerateETag(version);
            if (req.Headers["If-None-Match"] == etag)
                return Results.StatusCode(304);
            req.HttpContext.Response.Headers["ETag"] = etag;
            return Results.Ok(data);
        }).CacheOutput(p => p.Tag("confirmation-regs").Expire(TimeSpan.FromSeconds(10)));

        group.MapGet("/total", async (IConfirmationRegisterService service, HttpRequest req) =>
        {
            var total = await service.GetTotalRegistrations();
            var version = $"{total}";
            var etag = ETagHelper.GenerateETag(version);
            if (req.Headers["If-None-Match"] == etag)
                return Results.StatusCode(304);
            req.HttpContext.Response.Headers["ETag"] = etag;
            return Results.Ok(new { total });
        }).CacheOutput(p => p.Tag("confirmation-regs").Expire(TimeSpan.FromSeconds(10)));
    }
}


