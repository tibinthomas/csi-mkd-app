using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.OutputCaching;
using csi_mkd_premarital_app_BE.Utilities;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class SessionConfigEndpoints
{
    public static void MapSessionConfigEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/sessionconfig");

        group.MapGet("/", async (ISessionConfigService service, HttpRequest req) =>
        {
            var sessions = await service.GetAllSessions();
            var latest = sessions.Count == 0 ? DateTime.MinValue : sessions.Max(s => s.SubmittedDate);
            var version = $"{sessions.Count}:{latest.ToUniversalTime():O}";
            var etag = ETagHelper.GenerateETag(version);
            if (req.Headers["If-None-Match"] == etag)
                return Results.StatusCode(304);
            req.HttpContext.Response.Headers["ETag"] = etag;
            return Results.Ok(sessions);
        }).CacheOutput(p => p.Tag("sessions").Expire(TimeSpan.FromMinutes(2)));

        group.MapGet("/{id:int}", async (int id, ISessionConfigService service, HttpRequest req) =>
        {
            var session = await service.GetSessionById(id);
            if (session == null) return Results.NotFound();
            var version = $"{session.Id}:{session.SubmittedDate.ToUniversalTime():O}:{session.IsActive}:{session.SessionName}";
            var etag = ETagHelper.GenerateETag(version);
            if (req.Headers["If-None-Match"] == etag)
                return Results.StatusCode(304);
            req.HttpContext.Response.Headers["ETag"] = etag;
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

        group.MapGet("/sessions", async (int year, ISessionConfigService service, HttpRequest req) =>
        {
            var sessions = await service.GetSessionsByYear(year);
            var latest = sessions.Count == 0 ? DateTime.MinValue : sessions.Max(s => s.SubmittedDate);
            var version = $"{year}:{sessions.Count}:{latest.ToUniversalTime():O}";
            var etag = ETagHelper.GenerateETag(version);
            if (req.Headers["If-None-Match"] == etag)
                return Results.StatusCode(304);
            req.HttpContext.Response.Headers["ETag"] = etag;
            return Results.Ok(sessions);
        }).CacheOutput(p => p.Tag("sessions").Expire(TimeSpan.FromMinutes(2)));
    }
}


