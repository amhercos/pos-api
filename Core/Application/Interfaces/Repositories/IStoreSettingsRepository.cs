using Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Interfaces.Repositories
{
    public interface IStoreSettingsRepository
    {
        Task<StoreSettings?> GetByStoreIdAsync(Guid storeId, CancellationToken ct);
        Task UpdateAsync(StoreSettings settings, CancellationToken ct);
    }
}