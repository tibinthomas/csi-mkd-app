using CsiMkdFunctions.Models;

namespace CsiMkdFunctions.Repositories
{
    public interface ISessionConfigRepository
    {
        Task<List<SessionConfiguration>> GetAll();
        Task<List<SessionConfiguration>> GetByYear(int year);
    }
}