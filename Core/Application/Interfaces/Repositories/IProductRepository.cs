using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces.Repositories
{
    public interface IProductRepository
    {
        Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct);
        Task<IEnumerable<Product>> GetAllAsync(CancellationToken ct);
        Task<Product?> GetByIdAsync(Guid id, CancellationToken ct);
        void Add(Product product);
        void Remove(Product product);
        void Update(Product product);
        Task<int> CountLowStockAsync(Guid storeId, CancellationToken ct);
        Task<List<Product>> GetNearExpiryProductsAsync(Guid storeId);
    }
}
