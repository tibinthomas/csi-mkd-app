using System.ComponentModel.DataAnnotations;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Services;
using Microsoft.AspNetCore.Mvc;

namespace csi_mkd_premarital_app_BE.Endpoints;

/// <summary>
/// API endpoints for QuestionAnswers operations
/// </summary>
public static class QuestionAnswersEndpoints
{
    public static void MapQuestionAnswersEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/question-answers")
            .WithTags("Question Answers");
        // Secure by default: only questionnaire submission is public;
        // reading/updating/deleting answers requires an admin token.
        group.RequireAuthorization();

        // POST: Create new questionnaire answers
        group.MapPost("/", CreateQuestionAnswersAsync)
            .AllowAnonymous()
            .WithName("CreateQuestionAnswers")
            .WithSummary("Create new questionnaire answers")
            .WithDescription("Creates new questionnaire answers for a premarital registration")
            .Produces<QuestionAnswersResponseDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status409Conflict)
            .Produces(StatusCodes.Status500InternalServerError);

        // GET: Get questionnaire answers by registration ID
        group.MapGet("/registration/{registrationId:guid}", GetByRegistrationIdAsync)
            .WithName("GetQuestionAnswersByRegistrationId")
            .WithSummary("Get questionnaire answers by registration ID")
            .WithDescription("Retrieves questionnaire answers for a specific premarital registration")
            .Produces<QuestionAnswersResponseDto>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        // GET: Get questionnaire answers by document ID
        group.MapGet("/{id}", GetByIdAsync)
            .WithName("GetQuestionAnswersById")
            .WithSummary("Get questionnaire answers by document ID")
            .WithDescription("Retrieves questionnaire answers by document ID")
            .Produces<QuestionAnswersResponseDto>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        // PUT: Update questionnaire answers
        group.MapPut("/{id}", UpdateQuestionAnswersAsync)
            .WithName("UpdateQuestionAnswers")
            .WithSummary("Update questionnaire answers")
            .WithDescription("Updates existing questionnaire answers")
            .Produces<QuestionAnswersResponseDto>()
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        // DELETE: Delete questionnaire answers
        group.MapDelete("/{id}", DeleteQuestionAnswersAsync)
            .WithName("DeleteQuestionAnswers")
            .WithSummary("Delete questionnaire answers")
            .WithDescription("Deletes questionnaire answers by document ID")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status500InternalServerError);

        // GET: Get all questionnaire answers with pagination
        group.MapGet("/", GetAllQuestionAnswersAsync)
            .WithName("GetAllQuestionAnswers")
            .WithSummary("Get all questionnaire answers")
            .WithDescription("Retrieves all questionnaire answers with pagination")
            .Produces<IEnumerable<QuestionAnswersResponseDto>>()
            .Produces(StatusCodes.Status500InternalServerError);

        // GET: Check if answers exist for registration
        group.MapGet("/registration/{registrationId:guid}/exists", CheckExistsForRegistrationAsync)
            .WithName("CheckQuestionAnswersExists")
            .WithSummary("Check if questionnaire answers exist for registration")
            .WithDescription("Checks if questionnaire answers exist for a specific registration")
            .Produces<bool>()
            .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> CreateQuestionAnswersAsync(
        [FromBody] CreateQuestionAnswersDto createDto,
        IQuestionAnswersService service,
        HttpContext httpContext)
    {
        try
        {
            var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = httpContext.Request.Headers.UserAgent.ToString();

            var result = await service.CreateAsync(createDto, ipAddress, userAgent);
            
            return Results.Created($"/api/question-answers/{result.Id}", result);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Error creating questionnaire answers",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetByRegistrationIdAsync(
        Guid registrationId,
        IQuestionAnswersService service)
    {
        try
        {
            var result = await service.GetByRegistrationIdAsync(registrationId);
            
            return result != null ? Results.Ok(result) : Results.NotFound();
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Error getting questionnaire answers",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetByIdAsync(
        string id,
        IQuestionAnswersService service)
    {
        try
        {
            var result = await service.GetByIdAsync(id);
            
            return result != null ? Results.Ok(result) : Results.NotFound();
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Error getting questionnaire answers",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> UpdateQuestionAnswersAsync(
        string id,
        [FromBody] UpdateQuestionAnswersDto updateDto,
        IQuestionAnswersService service)
    {
        try
        {
            var result = await service.UpdateAsync(id, updateDto);
            
            return result != null ? Results.Ok(result) : Results.NotFound();
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Error updating questionnaire answers",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> DeleteQuestionAnswersAsync(
        string id,
        IQuestionAnswersService service)
    {
        try
        {
            var deleted = await service.DeleteAsync(id);
            
            return deleted ? Results.NoContent() : Results.NotFound();
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Error deleting questionnaire answers",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetAllQuestionAnswersAsync(
        IQuestionAnswersService service,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 50;

            var result = await service.GetAllAsync(page, pageSize);
            
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Error getting all questionnaire answers",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> CheckExistsForRegistrationAsync(
        Guid registrationId,
        IQuestionAnswersService service)
    {
        try
        {
            var exists = await service.ExistsForRegistrationAsync(registrationId);
            
            return Results.Ok(exists);
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Error checking questionnaire answers existence",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}