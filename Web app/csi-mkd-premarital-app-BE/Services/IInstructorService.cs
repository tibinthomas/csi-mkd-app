using csi_mkd_premarital_app_BE.DTOs;

namespace csi_mkd_premarital_app_BE.Services;

public interface IInstructorService
{
    Task<List<InstructorDto>> GetAllInstructors();
    Task<InstructorDto?> GetInstructorById(int id);
    Task<InstructorDto> CreateInstructor(CreateInstructorDto dto);
    Task<bool> UpdateInstructor(int id, UpdateInstructorDto dto);
    Task<bool> DeleteInstructor(int id);
}