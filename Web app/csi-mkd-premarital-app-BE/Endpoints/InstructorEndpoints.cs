using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace csi_mkd_premarital_app_BE.Endpoints;

public static class InstructorEndpoints
{
    public static void MapInstructorEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/instructors");
        group.DisableAntiforgery();

        group.MapGet("/", async (IInstructorService service) =>
        {
            var instructors = await service.GetAllInstructors();
            return Results.Ok(instructors);
        })
        .Produces<List<InstructorDto>>(StatusCodes.Status200OK)
        .CacheOutput(p => p.Tag("instructors"));

        group.MapGet("/{id:int}", async (int id, IInstructorService service) =>
        {
            var instructor = await service.GetInstructorById(id);
            if (instructor == null) return Results.NotFound();
            return Results.Ok(instructor);
        })
        .Produces<InstructorDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .CacheOutput(p => p.Tag("instructors").Expire(TimeSpan.FromMinutes(2)));

        group.MapPost("/", async (CreateInstructorDto dto, IInstructorService service, ICacheInvalidationService cacheService) =>
        {
            var created = await service.CreateInstructor(dto);
            await cacheService.InvalidateInstructorCachesAsync();
            return Results.Created($"/api/instructors/{created.Id}", created);
        })
        .Accepts<CreateInstructorDto>("application/json")
        .Produces<InstructorDto>(StatusCodes.Status201Created);

        group.MapPut("/{id:int}", async (int id, UpdateInstructorDto dto, IInstructorService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.UpdateInstructor(id, dto);
            await cacheService.InvalidateInstructorCachesAsync();
            return result ? Results.NoContent() : Results.NotFound(new { message = "Instructor not found." });
        })
        .Accepts<UpdateInstructorDto>("application/json")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:int}", async (int id, IInstructorService service, ICacheInvalidationService cacheService) =>
        {
            var result = await service.DeleteInstructor(id);
            await cacheService.InvalidateInstructorCachesAsync();
            return result ? Results.Ok(new { message = "Instructor deleted successfully." }) : Results.NotFound(new { message = "Instructor not found." });
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);
    }
}