using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Antiforgery;
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
        }).CacheOutput(p => p.Tag("sessions"));

        group.MapGet("/{id:int}", async (int id, ISessionConfigService service) =>
        {
            var session = await service.GetSessionById(id);
            if (session == null) return Results.NotFound();
            return Results.Ok(session);
        }).CacheOutput(p => p.Tag("sessions").Expire(TimeSpan.FromMinutes(2)));

        group.MapPost("/", async (CreateUpdateSessionDto dto, ISessionConfigService service, IOutputCacheStore cache) =>
        {
            var created = await service.CreateSession(dto);
            await cache.EvictByTagAsync("sessions", default);
            return Results.Created($"/api/sessionconfig/{created.Id}", created);
        });

        group.MapPut("/{id:int}", async (int id, CreateUpdateSessionDto dto, ISessionConfigService service, IOutputCacheStore cache) =>
        {
            if (dto.Id != id)
                return Results.BadRequest(new { message = "ID in URL does not match ID in request body." });

            var result = await service.UpdateSession(id, dto);
            await cache.EvictByTagAsync("sessions", default);
            return result ? Results.NoContent() : Results.Conflict(new { message = "The record was modified by another user. Please reload and try again." });
        });

        group.MapDelete("/{id:int}", async (int id, ISessionConfigService service, IOutputCacheStore cache) =>
        {
            var result = await service.DeleteSession(id);
            await cache.EvictByTagAsync("sessions", default);
            return result ? Results.Ok(new { message = "Session deleted successfully." }) : Results.BadRequest(new { message = "Cannot delete session. It is associated with one or more registrations." });
        });

        group.MapGet("/sessions", async (int year, ISessionConfigService service) =>
        {
            var sessions = await service.GetSessionsByYear(year);
            return Results.Ok(sessions);
        }).CacheOutput(p => p.Tag("sessions").Expire(TimeSpan.FromMinutes(2)));
    }
}


