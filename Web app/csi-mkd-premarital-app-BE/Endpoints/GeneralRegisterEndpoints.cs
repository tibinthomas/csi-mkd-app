using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Antiforgery;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class GeneralRegisterEndpoints
{
    public static void MapGeneralRegisterEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/generalregister");
        group.DisableAntiforgery();

        group.MapPost("/", async ([FromForm] GeneralRegisterDto dto, IGeneralRegisterService service, IRecaptchaService recaptcha, ICacheInvalidationService cacheService) =>
        {
            if (!await recaptcha.VerifyTokenAsync(dto.RecaptchaToken))
                return Results.BadRequest(new { Message = "Invalid reCAPTCHA token." });

            var result = await service.Register(dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Json(result.Data, statusCode: result.StatusCode);
        });

        group.MapPost("/save-photo-url", async ([FromForm] GeneralDocumentDto dto, IGeneralRegisterService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.SaveFiles(dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Json(result.Data, statusCode: result.StatusCode);
        });

        group.MapGet("/check-email", async (IGeneralRegisterService service, string email) => Results.Ok(await service.CheckEmailExists(email)))
            .CacheOutput(p => p.Tag("general-regs").Expire(TimeSpan.FromSeconds(10)));

        group.MapPut("/{id:int}/paymentstatus", async (int id, PaymentStatusUpdateDto dto, IGeneralRegisterService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.UpdatePaymentStatus(id, dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.StatusCode(result.StatusCode);
        });

        group.MapGet("/filter", async (IGeneralRegisterService service, HttpRequest req) =>
        {
            var filter = new GeneralRegisterFilterDto
            {
                Page = int.TryParse(req.Query["Page"], out var page) ? page : 1,
                PageSize = int.TryParse(req.Query["PageSize"], out var pageSize) ? pageSize : 10,
                Search = req.Query["Search"],
                UnapprovedOnly = bool.TryParse(req.Query["UnapprovedOnly"], out var unapproved) ? unapproved : null
            };
         
            var data = await service.GetFilteredRegistrations(filter);
            return Results.Ok(data);
        }).CacheOutput(p => p.Tag("general-regs").Expire(TimeSpan.FromSeconds(10)));

        group.MapGet("/total", async (IGeneralRegisterService service) =>
        {
            var total = await service.GetTotalRegistrations();
            return Results.Ok(new { total });
        }).CacheOutput(p => p.Tag("general-regs").Expire(TimeSpan.FromSeconds(10)));
    }
}


