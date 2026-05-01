using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces.Repositories
{
    public interface IPromotionRepository
    {
        void Add(Promotion promotion);
        void Update(Promotion promotion);
        void Remove(Promotion promotion);
        void RemoveRange(IEnumerable<Promotion> promotions);
        Task<Promotion?> GetByIdAsync(Guid id, CancellationToken ct);
        Task<IEnumerable<Promotion>> GetAllAsync(CancellationToken ct);
        Task<(IEnumerable<Promotion> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct);
        Task<Promotion?> GetByProductIdAsync(Guid productId, CancellationToken ct);
        Task<IEnumerable<Promotion>> GetActivePromotionsByStoreAsync(Guid storeId, CancellationToken ct);
        Task<List<Promotion>> GetByMainProductIdAsync(Guid productId, CancellationToken ct);
    }
}
