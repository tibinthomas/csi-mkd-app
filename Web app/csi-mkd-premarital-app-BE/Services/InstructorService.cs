using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using csi_mkd_premarital_app_BE.Repositories;

namespace csi_mkd_premarital_app_BE.Services;

public class InstructorService : IInstructorService
{
    private readonly IInstructorRepository _repository;

    public InstructorService(IInstructorRepository repository)
    {
        _repository = repository;
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