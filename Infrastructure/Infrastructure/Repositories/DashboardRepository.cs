using Application.Dto;
using Application.Features.Dashboard.Queries;
using Application.Interfaces.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class DashboardRepository(PosDbContext context) : IDashboardRepository
{
    public async Task<IEnumerable<TopProductResponse>> GetTopSellingProductsAsync(int count, CancellationToken ct)
    {
        return await context.TransactionItems
            .AsNoTracking()
            .Include(ti => ti.Product)
            .GroupBy(ti => ti.Product.Name)
            .Select(group => new TopProductResponse
            {
                Name = group.Key,
                QuantitySold = group.Sum(ti => ti.Quantity)
            })
            .OrderByDescending(x => x.QuantitySold)
            .Take(count)
            .ToListAsync(ct);
    }
}