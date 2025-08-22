using csi_mkd_premarital_app_BE.Models;

namespace csi_mkd_premarital_app_BE.Repositories;

public interface IInstructorRepository
{
    Task<List<Instructor>> GetAll();
    Task<Instructor?> GetById(int id);
    Task Create(Instructor instructor);
    Task<bool> Update(Instructor instructor);
    Task<bool> Delete(int id);
}