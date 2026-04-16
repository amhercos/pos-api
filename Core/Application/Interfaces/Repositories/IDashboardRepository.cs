using Application.Dto;
using Application.Features.Dashboard.Queries;

namespace Application.Interfaces.Repositories;

public interface IDashboardRepository
{
    Task<IEnumerable<TopProductResponse>> GetTopSellingProductsAsync(int count, CancellationToken ct);
}