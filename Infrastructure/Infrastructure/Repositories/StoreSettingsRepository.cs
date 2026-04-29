using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class StoreSettingsRepository(PosDbContext context) : IStoreSettingsRepository
    {
        public async Task<StoreSettings?> GetByStoreIdAsync(Guid storeId, CancellationToken ct)
        {
            return await context.StoreSettings
                .FirstOrDefaultAsync(s => s.StoreId == storeId, ct);
        }

        public async Task UpdateAsync(StoreSettings settings, CancellationToken ct)
        {
            var existing = await context.StoreSettings
                .FirstOrDefaultAsync(s => s.StoreId == settings.StoreId, ct);

            if (existing == null)
            {
                await context.StoreSettings.AddAsync(settings, ct);
            }
            else
            {
                context.Entry(existing).CurrentValues.SetValues(settings);
            }

            await context.SaveChangesAsync(ct);
        }
    }
}