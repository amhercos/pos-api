using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repositories
{
    public class CategoryRepository(PosDbContext context) : ICategoryRepository
    {
        public void Add(Category category) => context.Categories.Add(category);
        public void Update (Category category) => context.Categories.Update(category);


        public async Task<IEnumerable<Category>> GetAllAsync(CancellationToken ct)
        {
            return await context.Categories
            .AsNoTracking()
            .OrderBy(c => c.CategoryName)
            .ToListAsync(ct);
        }

        public async Task<Category?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            return await context.Categories
            .FirstOrDefaultAsync(c => c.Id == id, ct);
        }

        public void Remove(Category category) => context.Categories.Remove(category);

    }
}
