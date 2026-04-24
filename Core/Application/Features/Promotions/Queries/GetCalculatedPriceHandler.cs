using Application.Interfaces.Repositories;
using Domain.Entities.Enums;
using MediatR;

namespace Application.Features.Promotions.Queries;

public class GetCalculatedPriceHandler(
    IPromotionRepository promotionRepo,
    IProductRepository productRepo,
    IEnumerable<IPricingStrategy> strategies)
    : IRequestHandler<GetCalculatedPriceQuery, decimal>
{
    public async Task<decimal> Handle(GetCalculatedPriceQuery request, CancellationToken ct)
    {
        var product = await productRepo.GetByIdAsync(request.ProductId, ct);
        var promo = await promotionRepo.GetByProductIdAsync(request.ProductId, ct);

        if (product == null) return 0;
        if (promo == null || !promo.IsActive) return product.Price * request.Quantity;

        // Find the matching strategy
        var strategy = strategies.FirstOrDefault(s => s.Type == promo.Type);

        return strategy != null
            ? strategy.Calculate(product, promo, request.Quantity)
            : product.Price * request.Quantity;
    }
}