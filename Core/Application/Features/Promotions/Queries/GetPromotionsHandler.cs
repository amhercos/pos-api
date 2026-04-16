using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;

namespace Application.Features.Promotions.Queries;

public class GetPromotionsHandler(IPromotionRepository promotionRepo)
    : IRequestHandler<GetPromotionsQuery, IEnumerable<PromotionResponse>>
{
    public async Task<IEnumerable<PromotionResponse>> Handle(GetPromotionsQuery request, CancellationToken ct)
    {
        var promotions = await promotionRepo.GetAllAsync(ct);

        return promotions.Select(p => new PromotionResponse
        {
            Id = p.Id,
            Name = p.Name,
            ProductName = p.MainProduct?.Name ?? "Unknown",
            OriginalPrice = p.MainProduct?.Price ?? 0,
            PromoPrice = p.PromoPrice ?? 0,
            PromoQuantity = p.PromoQuantity,
            IsActive = p.IsActive
        });
    }
}