using Application.Dto;
using Application.Interfaces.Repositories;
using MediatR;
using System.Linq;

namespace Application.Features.Products.Queries;
public class GetProductsHandler(IProductRepository productRepository)
    : IRequestHandler<GetProductQuery, PagedResponse<ProductDto>>
{
    public async Task<PagedResponse<ProductDto>> Handle(GetProductQuery request, CancellationToken ct)
    {
        var (products, totalCount) = await productRepository.GetPagedAsync(request.Page, request.PageSize, ct);

        var dtos = products.Select(p => new ProductDto(
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

        return new PagedResponse<ProductDto>(dtos, totalCount);
    }
}