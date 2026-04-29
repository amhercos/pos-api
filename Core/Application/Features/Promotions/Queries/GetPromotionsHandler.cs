using Application.Interfaces.Repositories;
using Application.Features.Promotions.Commands;
using MediatR;
using Application.Dto;

namespace Application.Features.Promotions.Queries;

public class GetPromotionsHandler(IPromotionRepository promotionRepo)
    : IRequestHandler<GetPromotionsQuery, IEnumerable<PromotionResponse>>
{
    public async Task<IEnumerable<PromotionResponse>> Handle(GetPromotionsQuery request, CancellationToken ct)
    {
        var promotions = await promotionRepo.GetAllAsync(ct);

        return promotions
            .GroupBy(p => p.MainProductId)
            .Select(group => {
                var first = group.First();
                return new PromotionResponse
                {
                    MainProductId = group.Key,
                    Name = first.Name,
                    ProductName = first.MainProduct?.Name ?? "Unknown",
                    OriginalPrice = first.MainProduct?.Price ?? 0,
                    IsActive = group.Any(p => p.IsActive),
                    Tiers = group
                        .Where(p => p.PromoQuantity.HasValue)
                        .Select(p => new PromoTier(p.PromoQuantity!.Value, p.PromoPrice ?? 0))
                        .OrderBy(t => t.Quantity)
                        .ToList(),
                    TieUpProductName = first.TieUpProduct?.Name
                };
            });
    }
}