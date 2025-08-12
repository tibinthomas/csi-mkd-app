using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class SessionConfigEndpoints
{
    public static void MapSessionConfigEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/sessionconfig");
        group.DisableAntiforgery();

        group.MapGet("/", async (ISessionConfigService service) =>
        {
            var sessions = await service.GetAllSessions();
            return Results.Ok(sessions);
        })
        .Produces<List<SessionConfigurationDto>>(StatusCodes.Status200OK)
        .CacheOutput(p => p.Tag("sessions"));

        group.MapGet("/{id:int}", async (int id, ISessionConfigService service) =>
        {
            var session = await service.GetSessionById(id);
            if (session == null) return Results.NotFound();
            return Results.Ok(session);
        })
        .Produces<SessionConfigurationDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .CacheOutput(p => p.Tag("sessions").Expire(TimeSpan.FromMinutes(2)));

        group.MapPost("/", async (CreateUpdateSessionDto dto, ISessionConfigService service, ICacheInvalidationService cacheService) =>
        {
            var created = await service.CreateSession(dto);
            await cacheService.InvalidateSessionCachesAsync();
            return Results.Created($"/api/sessionconfig/{created.Id}", created);
        })
        .Accepts<CreateUpdateSessionDto>("application/json")
        .Produces<SessionConfigurationDto>(StatusCodes.Status201Created);

        group.MapPut("/{id:int}", async (int id, CreateUpdateSessionDto dto, ISessionConfigService service, ICacheInvalidationService cacheService) =>
        {
            if (dto.Id != id)
                return Results.BadRequest(new { message = "ID in URL does not match ID in request body." });

            var result = await service.UpdateSession(id, dto);
            await cacheService.InvalidateSessionCachesAsync();
            return result ? Results.NoContent() : Results.Conflict(new { message = "The record was modified by another user. Please reload and try again." });
        })
        .Accepts<CreateUpdateSessionDto>("application/json")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status409Conflict);

        group.MapDelete("/{id:int}", async (int id, ISessionConfigService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.DeleteSession(id);
            await cacheService.InvalidateSessionCachesAsync();
            return result ? Results.Ok(new { message = "Session deleted successfully." }) : Results.BadRequest(new { message = "Cannot delete session. It is associated with one or more registrations." });
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/sessions", async (int year, ISessionConfigService service) =>
        {
            var sessions = await service.GetSessionsByYear(year);
            return Results.Ok(sessions);
        })
        .Produces<List<SessionConfigurationDto>>(StatusCodes.Status200OK)
        .CacheOutput(p => p.Tag("sessions").Expire(TimeSpan.FromMinutes(2)));

        group.MapPost("/deactivate-sessions", async (ISessionConfigService service) =>
        {
            await service.DeactivateSessionsStartingIn3DaysAsync();
            return Results.Ok(new { message = "Sessions starting in 3 days have been deactivated." });
        })
        .Produces(StatusCodes.Status200OK);

    }
}


