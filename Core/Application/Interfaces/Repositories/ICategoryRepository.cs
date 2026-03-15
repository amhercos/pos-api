using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync(CancellationToken ct);
        Task<Category?> GetByIdAsync(Guid id, CancellationToken ct);
        void Add(Category category);
        void Remove(Category category);
    }
}
