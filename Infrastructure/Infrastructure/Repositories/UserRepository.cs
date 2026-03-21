using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace Infrastructure.Repositories
{
    public class UserRepository(PosDbContext context) : IUserRepository
    {
        public async Task<IEnumerable<User>> GetStaffByStoreIdAsync(Guid storeId, CancellationToken ct)
        {
            return await context.Users
            .AsQueryable()
            .Where(u => u.StoreId == storeId && u.Role == "Cashier")
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync(ct);
        }

        public async Task<bool> IsEmailUniqueAsync(string email)
        {
            return !await context.Users
                .AsQueryable()
                .AnyAsync(u => u.Email == email);
        }

       
        public async Task<User?> GetByIdAsync(Guid Id, CancellationToken ct = default)
        {
            return await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == Id, ct);
        }
    }
}
