using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Interfaces;

public interface IAppIdentityDbContext
{
    DbSet<User> Users { get; }
    DbSet<Store> Stores { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}