using Microsoft.EntityFrameworkCore;
using MHBackend.Data;
using MHBackend.Models;

namespace MHBackend.Repositories{
public interface IUserRepository
{
    Task<User> GetByFirebaseUidAsync(string firebaseUid);
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
}

public class UserRepository : IUserRepository
{
    private readonly MyAppDbContext _context;

    public UserRepository(MyAppDbContext context)
    {
        _context = context;
    }

    public async Task<User> GetByFirebaseUidAsync(string firebaseUid)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }
}
}