using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;

namespace csi_mkd_premarital_app_BE.Services;

public class InstructorService : IInstructorService
{
    private readonly IInstructorRepository _repository;
    private readonly IFeedbackRepository _feedbackRepository;

    public InstructorService(IInstructorRepository repository, IFeedbackRepository feedbackRepository)
    {
        _repository = repository;
        _feedbackRepository = feedbackRepository;
    }

    public async Task<List<InstructorDto>> GetAllInstructors()
    {
        var instructors = await _repository.GetAll();
        return instructors.Select(ToDto).ToList();
    }

    public async Task<InstructorDto?> GetInstructorById(int id)
    {
        var instructor = await _repository.GetById(id);
        return instructor == null ? null : ToDto(instructor);
    }

    public async Task<InstructorDto> CreateInstructor(CreateInstructorDto dto)
    {
        var instructor = new Instructor
        {
            Name = dto.Name,
            Qualification = dto.Qualification
        };
        
        await _repository.Create(instructor);
        return ToDto(instructor);
    }

    public async Task<bool> UpdateInstructor(int id, UpdateInstructorDto dto)
    {
        var existing = await _repository.GetById(id);
        if (existing == null) return false;

        existing.Name = dto.Name;
        existing.Qualification = dto.Qualification;
        existing.LastModifiedAt = DateTime.UtcNow;
        
        return await _repository.Update(existing);
    }

    public async Task<bool> DeleteInstructor(int id)
    {
        return await _repository.Delete(id);
    }

    public async Task<List<InstructorRatingDto>> GetInstructorsWithRatings()
    {
        var instructors = await _repository.GetAll();
        var feedbacks = await _feedbackRepository.GetAllAsync();
        
        var instructorRatings = instructors.Select(instructor =>
        {
            // Get all feedback entries for this instructor across all classes
            var instructorFeedbacks = feedbacks
                .SelectMany(feedback => feedback.FeedbackEntries
                    .Where(entry => entry.Detail.InstructorId == instructor.Id)
                    .Select(entry => entry.Detail.Ratings))
                .ToList();

            var ratingDto = new InstructorRatingDto
            {
                InstructorId = instructor.Id,
                InstructorName = instructor.Name,
                Qualification = instructor.Qualification,
                TotalFeedbackCount = instructorFeedbacks.Count
            };

            if (instructorFeedbacks.Count > 0)
            {
                // Calculate averages
                ratingDto.RatingBreakdown = new InstructorRatingBreakdownDto
                {
                    AverageQuality = Math.Round(instructorFeedbacks.Average(r => r.Quality), 2),
                    AverageRelevance = Math.Round(instructorFeedbacks.Average(r => r.Relevance), 2),
                    AverageEngagement = Math.Round(instructorFeedbacks.Average(r => r.Engagement), 2),
                    AverageOrganization = Math.Round(instructorFeedbacks.Average(r => r.Organization), 2)
                };
                
                // Calculate overall average
                ratingDto.AverageRating = Math.Round((
                    ratingDto.RatingBreakdown.AverageQuality +
                    ratingDto.RatingBreakdown.AverageRelevance +
                    ratingDto.RatingBreakdown.AverageEngagement +
                    ratingDto.RatingBreakdown.AverageOrganization
                ) / 4.0, 2);
            }
            else
            {
                ratingDto.AverageRating = 0;
                ratingDto.RatingBreakdown = new InstructorRatingBreakdownDto();
            }

            return ratingDto;
        }).ToList();

        return instructorRatings.OrderByDescending(r => r.AverageRating).ToList();
    }

    private static InstructorDto ToDto(Instructor instructor) => new()
    {
        Id = instructor.Id,
        Name = instructor.Name,
        Qualification = instructor.Qualification,
        CreatedAt = instructor.CreatedAt,
        CreatedBy = instructor.CreatedBy,
        LastModifiedAt = instructor.LastModifiedAt,
        LastModifiedBy = instructor.LastModifiedBy
    };
}