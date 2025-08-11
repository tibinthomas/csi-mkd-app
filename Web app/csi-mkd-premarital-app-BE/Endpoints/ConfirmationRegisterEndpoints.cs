using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class ConfirmationRegisterEndpoints
{
    public static void MapConfirmationRegisterEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/confirmationregister");
        group.DisableAntiforgery();

        group.MapPost("/", async (IConfirmationRegisterService service, IRecaptchaService recaptcha, ICacheInvalidationService cacheService, [FromBody] ConfirmationRegisterDto dto) =>
        {
            if (!await recaptcha.VerifyTokenAsync(dto.RecaptchaToken))
                return Results.BadRequest(new { Message = "Invalid reCAPTCHA token." });
            var result = await service.Register(dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Json(result.Data, statusCode: result.StatusCode);
        })
        .Accepts<ConfirmationRegisterDto>("application/json");

        group.MapPost("/save-file-url", async (IConfirmationRegisterService service, ICacheInvalidationService cacheService, [FromBody] ConfirmationDocumentDto dto) =>
        {
            var result = await service.SaveFiles(dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Json(result.Data, statusCode: result.StatusCode);
        })
        .Accepts<ConfirmationDocumentDto>("application/json");

        group.MapGet("/filter", async (IConfirmationRegisterService service, [AsParameters] ConfirmationRegisterFilterDto filter) =>
        {
            var data = await service.GetFilteredRegistrations(filter);
            return Results.Ok(data);
        })
        .CacheOutput(p => p.Tag("confirmation-regs").Expire(TimeSpan.FromSeconds(10)));

        group.MapGet("/total", async (IConfirmationRegisterService service) =>
        {
            var total = await service.GetTotalRegistrations();
            return Results.Ok(new { total });
        })
        .CacheOutput(p => p.Tag("confirmation-regs").Expire(TimeSpan.FromSeconds(10)));
    }
}


