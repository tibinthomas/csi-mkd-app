using csi_mkd_premarital_app_BE.Data;
using csi_mkd_premarital_app_BE.DTOs;
using csi_mkd_premarital_app_BE.Models;
using Microsoft.EntityFrameworkCore;

namespace csi_mkd_premarital_app_BE.Repositories;

public class GeneralRegisterRepository : IGeneralRegisterRepository
{
    private readonly ApplicationDbContext _context;

    public GeneralRegisterRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> AddRegistration(GeneralRegistration registration)
    {
        _context.GeneralRegistrations.Add(registration);
        await _context.SaveChangesAsync();
        return registration.Id;
    }

    public async Task AddGeneralFiles(GeneralDocument documents)
    {
        _context.GeneralDocuments.Add(documents);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> CheckEmailExists(string email)
        => await _context.GeneralRegistrations
            .AnyAsync(r => r.Email.ToLower() == email.ToLower());

}


