using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Antiforgery;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class PremaritalRegisterEndpoints
{
    public static void MapPremaritalRegisterEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/premaritalregister");
        group.DisableAntiforgery();

        group.MapPost("/", async ([FromForm] PremaritalRegisterDto dto, IPremaritalRegisterService service, IRecaptchaService recaptcha, IOutputCacheStore cache) =>
        {
            if (!await recaptcha.VerifyTokenAsync(dto.RecaptchaToken))
                return Results.BadRequest(new { Message = "Invalid reCAPTCHA token." });

            var result = await service.Register(dto);
            await cache.EvictByTagAsync("premarital-regs", default);
            return Results.Json(result.Data, statusCode: result.StatusCode);
        });

        group.MapPost("/save-file-urls", async ([FromForm] PremaritalDocumentDto dto, IPremaritalRegisterService service, IOutputCacheStore cache) =>
        {
            var result = await service.SaveFiles(dto);
            await cache.EvictByTagAsync("premarital-regs", default);
            return Results.Json(result.Data, statusCode: result.StatusCode);
        });

        group.MapPut("/{id:int}/paymentstatus", async (int id, PaymentStatusUpdateDto dto, IPremaritalRegisterService service, IOutputCacheStore cache) =>
        {
            var result = await service.UpdatePaymentStatus(id, dto);
            await cache.EvictByTagAsync("premarital-regs", default);
            return Results.StatusCode(result.StatusCode);
        });

        group.MapGet("/check-email", async (IPremaritalRegisterService service, string email) => Results.Ok(await service.CheckEmailExists(email)))
            .CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));

        group.MapGet("/filter", async (IPremaritalRegisterService service, HttpRequest req) =>
        {
            var filter = new RegistrationFilterDto
            {
                Page = int.TryParse(req.Query["Page"], out var page) ? page : 1,
                PageSize = int.TryParse(req.Query["PageSize"], out var pageSize) ? pageSize : 10,
                Search = req.Query["Search"],
                UnapprovedOnly = bool.TryParse(req.Query["UnapprovedOnly"], out var u) ? u : null,
                ActiveSessionOnly = bool.TryParse(req.Query["ActiveSessionOnly"], out var a) ? a : null,
                SessionYear = int.TryParse(req.Query["SessionYear"], out var y) ? y : null,
                SessionName = req.Query["SessionName"]
            };
            var data = await service.GetFilteredRegistrations(filter);
            return Results.Ok(data);
        }).CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));

        group.MapGet("/total", async (IPremaritalRegisterService service) =>
        {
            var total = await service.GetTotalRegistrations();
            return Results.Ok(new { total });
        }).CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));
    }
}


