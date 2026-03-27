using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces.Repositories
{
    public interface IStoreRepository
    {
        Task AddAsync(Store store, CancellationToken ct);
        Task<bool> ExistsByNameAsync(string name, CancellationToken ct);
        // StoreSettings
        Task<Store?> GetStoreWithSettingsAsync(Guid storeId, CancellationToken ct);
        Task UpdateAsync(Store store, CancellationToken ct);
    }
}
