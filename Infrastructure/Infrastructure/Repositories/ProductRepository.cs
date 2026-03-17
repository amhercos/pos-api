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
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id, ct);
        }

        public void Remove(Product product) => context.Products.Remove(product);

    }
}
