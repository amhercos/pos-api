using Application.Dto;
using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Products.Queries;


public class GetProductsHandler(IProductRepository productRepository)
    : IRequestHandler<GetProductQuery, IEnumerable<ProductDto>>
{
    public async Task<IEnumerable<ProductDto>> Handle(GetProductQuery request, CancellationToken ct)
    {
        var products = await productRepository.GetAllAsync(ct);

        return products.Select(p => new ProductDto(
            p.Id,
            p.Name,
            p.Description,
            p.Price,
            p.Stock,
            p.LowStockThreshold,
            p.Category?.CategoryName ?? "No Category",
            p.ExpiryDate,
            p.CategoryId
        ));
    }
}