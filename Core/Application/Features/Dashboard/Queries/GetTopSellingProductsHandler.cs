using Application.Dto;
using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Dashboard.Queries;

public class GetTopSellingProductsHandler(IDashboardRepository dashboardRepo)
    : IRequestHandler<GetTopSellingProductsQuery, IEnumerable<TopProductResponse>>
{
    public async Task<IEnumerable<TopProductResponse>> Handle(GetTopSellingProductsQuery request, CancellationToken ct)
    {
        return await dashboardRepo.GetTopSellingProductsAsync(request.Count, ct);
    }
}