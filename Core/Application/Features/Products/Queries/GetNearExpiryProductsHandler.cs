using Application.Dto;
using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Products.Queries
{
    public class GetNearExpiryProductsHandler(IProductRepository productRepository)
        : IRequestHandler<GetNearExpiryProductsQuery, List<NearExpiryProductDto>>
    {
        public async Task<List<NearExpiryProductDto>> Handle(GetNearExpiryProductsQuery request, CancellationToken ct)
        {
            var products = await productRepository.GetNearExpiryProductsAsync(request.StoreId);

        
            return products.Select(p => new NearExpiryProductDto(
                p.Id,
                p.Name,
                p.Stock,
                p.ExpiryDate,
                (p.ExpiryDate.Value.ToDateTime(TimeOnly.MinValue) - DateTime.Today).Days
            )).ToList();
        }
    }
}