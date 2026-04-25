using Application.Dto;
using Application.Interfaces.Repositories;
using Domain.Entities.Enums;
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
            p.CategoryId,
         
            p.Promotions?.Select(promo => new PromotionDto(
                promo.Id,
                (PromotionType)promo.Type,
                promo.PromoQuantity,
                promo.PromoPrice,
                promo.TieUpProductId,
                promo.TieUpQuantity,
                promo.IsActive
            )).ToList()
        ));

        return new PagedResponse<ProductDto>(dtos, totalCount);
    }
}