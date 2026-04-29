using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class PromotionRepository(PosDbContext context) : IPromotionRepository
    {
        public void Add(Promotion promotion) => context.Promotions.Add(promotion);

        public void Update(Promotion promotion) => context.Promotions.Update(promotion);

        public void Remove(Promotion promotion)
        {
            promotion.IsActive = false;
            context.Promotions.Update(promotion);
        }

        public async Task<Promotion?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            return await context.Promotions
                .Include(p => p.MainProduct)
                .Include(p => p.TieUpProduct)
                .FirstOrDefaultAsync(p => p.Id == id, ct);
        }

        public async Task<IEnumerable<Promotion>> GetAllAsync(CancellationToken ct)
        {
            return await context.Promotions
                .Include(p => p.MainProduct)
                .Include(p => p.TieUpProduct)
                //.Where(p => p.IsActive)
                .AsNoTracking()
                .ToListAsync(ct);
        }

        public async Task<(IEnumerable<Promotion> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct)
        {
            var query = context.Promotions
                .Include(p => p.MainProduct)
                .Include(p => p.TieUpProduct)
                .Where(p => p.IsActive)
                .AsNoTracking();

            var totalCount = await query.CountAsync(ct);

            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }

        public async Task<Promotion?> GetByProductIdAsync(Guid productId, CancellationToken ct)
        {
            return await context.Promotions
                .Include(p => p.MainProduct)
                .Include(p => p.TieUpProduct)
                .Where(p => p.MainProductId == productId && p.IsActive)
                .FirstOrDefaultAsync(ct);
        }

        public async Task<IEnumerable<Promotion>> GetActivePromotionsByStoreAsync(Guid storeId, CancellationToken ct)
        {
            return await context.Promotions
                .Include(p => p.MainProduct)
                .Include(p => p.TieUpProduct)
                .Where(p => p.StoreId == storeId && p.IsActive)
                .AsNoTracking()
                .ToListAsync(ct);
        }
    }
}