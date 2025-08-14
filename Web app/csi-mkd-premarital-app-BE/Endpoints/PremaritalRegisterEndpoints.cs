using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Antiforgery;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class PremaritalRegisterEndpoints
{
    public static void MapPremaritalRegisterEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/premaritalregister");
        group.DisableAntiforgery();

        group.MapPost("/", async ([FromForm] PremaritalRegisterDto dto, IPremaritalRegisterService service, IRecaptchaService recaptcha, ICacheInvalidationService cacheService) =>
        {
            if (!await recaptcha.VerifyTokenAsync(dto.RecaptchaToken))
                return Results.BadRequest(new { Message = "Invalid reCAPTCHA token." });

            var result = await service.Register(dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Json(result.Data, statusCode: result.StatusCode);
        })
        .Accepts<PremaritalRegisterDto>("multipart/form-data");

        group.MapPost("/save-file-urls", async ([FromForm] PremaritalDocumentDto dto, IPremaritalRegisterService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.SaveFiles(dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Json(result.Data, statusCode: result.StatusCode);
        })
        .Accepts<PremaritalDocumentDto>("multipart/form-data");

        group.MapPut("/{id:int}/paymentstatus", async (int id, PaymentStatusUpdateDto dto, IPremaritalRegisterService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.UpdatePaymentStatus(id, dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.StatusCode(result.StatusCode);
        });

        group.MapGet("/check-email", async (IPremaritalRegisterService service, string email) =>
        {
            var (exists, userId) = await service.CheckEmailExists(email);
            return Results.Ok(new CheckEmailResponseDto { Exists = exists, UserId = userId });
        })
        .Produces<CheckEmailResponseDto>(StatusCodes.Status200OK)
        .CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));

        group.MapGet("/filter", async (IPremaritalRegisterService service, [AsParameters] RegistrationFilterDto filter) =>
        {
            var data = await service.GetFilteredRegistrations(filter);
            return Results.Ok(data);
        })
        .CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));

        group.MapGet("/total", async (IPremaritalRegisterService service) =>
        {
            var total = await service.GetTotalRegistrations();
            return Results.Ok(new { total });
        })
        .CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));

        group.MapGet("/{id:int}", async (IPremaritalRegisterService service, int id) =>
        {
            var registration = await service.GetRegistrationById(id);
            if (registration == null)
            {
                return Results.NotFound();
            }
            return Results.Ok(registration);
        })
        .CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));
    }
}
