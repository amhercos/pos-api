using Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Interfaces.Repositories
{
    public interface IStoreRepository
    {
        Task AddAsync(Store store, CancellationToken ct);
        Task<bool> ExistsByNameAsync(string name, CancellationToken ct);
        Task<Store?> GetByIdAsync(Guid storeId, CancellationToken ct);

        Task UpdateAsync(Store store, CancellationToken ct);
    }
}