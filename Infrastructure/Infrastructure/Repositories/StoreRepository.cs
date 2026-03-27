using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class StoreRepository(PosDbContext context) : IStoreRepository
    {

        public async Task AddAsync(Store store, CancellationToken ct)
        {
            await context.Stores.AddAsync(store, ct);
        }

        public async Task<bool> ExistsByNameAsync(string name, CancellationToken ct)
        {
            return await context.Stores.AnyAsync(s => s.StoreName == name, ct);
        }

        public async Task<Store?> GetStoreWithSettingsAsync(Guid storeId, CancellationToken ct)
        {
            return await context.Stores
                .Include(s => s.Settings)
                .FirstOrDefaultAsync(s => s.Id == storeId, ct);
        }

        public async Task UpdateAsync(Store store, CancellationToken ct)
        {
            context.Stores.Update(store);
            await context.SaveChangesAsync(ct);
        }
    }
}
