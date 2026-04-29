using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class StoreRepository(AppIdentityDbContext context) : IStoreRepository
    {
        public async Task AddAsync(Store store, CancellationToken ct)
        {
            await context.Stores.AddAsync(store, ct);
            await context.SaveChangesAsync(ct);
        }

        public async Task<bool> ExistsByNameAsync(string name, CancellationToken ct)
        {
            return await context.Stores.AnyAsync(s => s.StoreName == name, ct);
        }

        // Updated: Removed .Include(s => s.Settings) 
        // This repository now strictly handles Public Store Identity data.
        public async Task<Store?> GetByIdAsync(Guid storeId, CancellationToken ct)
        {
            return await context.Stores
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == storeId, ct);
        }

        public async Task UpdateAsync(Store store, CancellationToken ct)
        {
            context.Stores.Update(store);
            await context.SaveChangesAsync(ct);
        }
    }
}