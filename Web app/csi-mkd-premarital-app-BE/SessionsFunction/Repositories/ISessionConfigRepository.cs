using SessionsFunction.Models;

namespace SessionsFunction.Repositories
{
    public interface ISessionConfigRepository
    {
        Task<List<SessionConfiguration>> GetAll();
        Task<List<SessionConfiguration>> GetByYear(int year);
    }
}