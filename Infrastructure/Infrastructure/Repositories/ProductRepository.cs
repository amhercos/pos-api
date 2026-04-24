using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repositories
{
    public class ProductRepository(PosDbContext context) : IProductRepository
    {

        public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, CancellationToken ct)
        {
            var query = context.Products
                .Include(p => p.Category)
                .AsNoTracking()
                .Where(p => !p.IsDeleted);

            var totalCount = await query.CountAsync(ct);

            var items = await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalCount);
        }
        public void Add(Product product) => context.Products.Add(product);
        public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken ct)
        {
            return await context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .ToListAsync(ct);
        }

        public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            return await context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id, ct);
        }

        public void Remove(Product product)
        {
            product.IsDeleted = true;
            context.Products.Update(product);
        }

        public async Task<int> CountLowStockAsync(Guid storeId, CancellationToken ct)
        {
            return await context.Products
                .Where(p => p.StoreId == storeId && p.Stock <= p.LowStockThreshold)
                .CountAsync(ct);
        }

        public void Update(Product product) => context.Products.Update(product);



        public async Task<List<Product>> GetNearExpiryProductsAsync(Guid storeId)
        {
            var settings = await context.StoreSettings
                .FirstOrDefaultAsync(s => s.StoreId == storeId);

            int alertDays = settings?.NearExpiryAlertDays ?? 30;

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var thresholdDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(alertDays));

            return await context.Products
                .Where(p => p.StoreId == storeId
                         && p.ExpiryDate <= thresholdDate
                         && p.ExpiryDate >= today)
                .ToListAsync();
        }

        public async Task<List<Product>> GetByIdsWithPromotionsAsync(IEnumerable<Guid> ids, Guid storeId, CancellationToken ct)
        {
            return await context.Products
                .Include(p => p.Promotions)
                .Where(p => ids.Contains(p.Id) && p.StoreId == storeId)
                .ToListAsync(ct);
        }
    }
}
