using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class PremaritalRegisterEndpoints
{
    public static void MapPremaritalRegisterEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/premaritalregister");
        group.DisableAntiforgery();

        // Registration endpoint
        group.MapPost("/", async ([FromForm] PremaritalRegisterDto dto, IPremaritalRegisterService service, IRecaptchaService recaptcha, ICacheInvalidationService cacheService) =>
        {
            if (!await recaptcha.VerifyTokenAsync(dto.RecaptchaToken))
                return Results.BadRequest(new { Message = "Invalid reCAPTCHA token." });

            var result = await service.Register(dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Json(result.Data, statusCode: result.StatusCode);
        })
        .Accepts<PremaritalRegisterDto>("multipart/form-data");

        // Unified file save/update endpoint
        group.MapPost("/files/{registrationId:guid}", async (
            Guid registrationId,
            [FromForm] PremaritalDocumentDto dto,
            IPremaritalRegisterService service,
            ICacheInvalidationService cacheService) =>
        {
            dto.RegistrationId = registrationId; // enforce registration ID from route
            var result = await service.UpsertFiles(dto);

            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Json(result.Data, statusCode: result.StatusCode);
        })
        .Accepts<PremaritalDocumentDto>("multipart/form-data")
        .Produces<object>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status500InternalServerError);

        // Update registration endpoint
        group.MapPut("/{id:guid}", async (Guid id, [FromBody] UpdatePremaritalRegisterDto dto, IPremaritalRegisterService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.UpdateRegistration(id, dto);
            if (!result)
                return Results.NotFound(new { message = "Registration not found or update failed." });

            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.NoContent();
        })
        .Accepts<UpdatePremaritalRegisterDto>("application/json")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);

        // Update payment status
        group.MapPut("/{id:guid}/paymentstatus", async (Guid id, PaymentStatusUpdateDto dto, IPremaritalRegisterService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.UpdatePaymentStatus(id, dto);
            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.StatusCode(result.StatusCode);
        });

        // Check email
        group.MapGet("/check-email", async (IPremaritalRegisterService service, string email) =>
        {
            var (exists, userId) = await service.CheckEmailExists(email);
            return Results.Ok(new CheckEmailResponseDto { Exists = exists, UserId = userId });
        })
        .Produces<CheckEmailResponseDto>(StatusCodes.Status200OK)
        .CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));

        // Filter registrations
        group.MapGet("/filter", async (IPremaritalRegisterService service, [AsParameters] RegistrationFilterDto filter) =>
        {
            var data = await service.GetFilteredRegistrations(filter);
            return Results.Ok(data);
        })
        .CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));

        // Total registrations
        group.MapGet("/total", async (IPremaritalRegisterService service) =>
        {
            var total = await service.GetTotalRegistrations();
            return Results.Ok(new { total });
        })
        .CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));

        // Get registration by ID
        group.MapGet("/{id:guid}", async (IPremaritalRegisterService service, Guid id) =>
        {
            var registration = await service.GetRegistrationById(id);
            if (registration == null)
                return Results.NotFound();

            return Results.Ok(registration);
        })
        .CacheOutput(p => p.Tag("premarital-regs").Expire(TimeSpan.FromSeconds(10)));

        // Delete registration
        group.MapDelete("/{id:guid}", async (Guid id, IPremaritalRegisterService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.DeleteRegistration(id);
            if (!result)
                return Results.NotFound(new { message = "Registration not found." });

            await cacheService.InvalidateRegistrationCachesAsync();
            return Results.Ok(new { message = "Registration deleted successfully." });
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);
    }
}
