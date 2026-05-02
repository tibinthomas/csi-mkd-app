using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories;

public class InstructorRepository : IInstructorRepository
{
    private readonly ApplicationDbContext _context;

    public InstructorRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Instructor>> GetAll()
    {
        return await _context.Instructors
            .AsNoTracking()
            .OrderBy(i => i.Name)
            .ToListAsync();
    }

    public async Task<Instructor?> GetById(int id)
    {
        return await _context.Instructors
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task Create(Instructor instructor)
    {
        instructor.CreatedAt = DateTime.UtcNow;
        _context.Instructors.Add(instructor);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> Update(Instructor instructor)
    {
        _context.Entry(instructor).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;
        }
    }

    public async Task<bool> Delete(int id)
    {
        var instructor = await _context.Instructors.FindAsync(id);
        if (instructor == null) return false;

        _context.Instructors.Remove(instructor);
        await _context.SaveChangesAsync();
        return true;
    }
}