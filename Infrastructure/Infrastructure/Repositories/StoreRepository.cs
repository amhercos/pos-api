using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class StoreRepository : IStoreRepository
    {
        private readonly PosDbContext _dbContext;
        public StoreRepository(PosDbContext context)
        {
            _dbContext = context;
        }

        public async Task AddAsync(Store store, CancellationToken ct)
        {
            await _dbContext.Stores.AddAsync(store, ct);
        }

        public async Task<bool> ExistsByNameAsync(string name, CancellationToken ct)
        {
            return await _dbContext.Stores.AnyAsync(s => s.StoreName == name, ct);
        }
    }
}
