using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class UserRepository(AppIdentityDbContext context) : IUserRepository
    {
        public async Task<IEnumerable<User>> GetStaffByStoreIdAsync(Guid storeId, CancellationToken ct)
        {
            // Joining the Identity tables to filter by Role Name "Cashier"
            return await (from user in context.Users
                          join userRole in context.UserRoles on user.Id equals userRole.UserId
                          join role in context.Roles on userRole.RoleId equals role.Id
                          where user.StoreId == storeId && role.Name == "Cashier"
                          select user)
                          .OrderByDescending(u => u.CreatedAt)
                          .ToListAsync(ct);
        }

        public async Task<bool> IsEmailUniqueAsync(string email)
        {
            return !await context.Users
                .AnyAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id, ct);
        }
    }
}