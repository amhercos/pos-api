using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Promotions.Queries;

public class GetCalculatedPriceHandler(
    IPromotionRepository promotionRepo,
    IProductRepository productRepo) : IRequestHandler<GetCalculatedPriceQuery, decimal>
{
    public async Task<decimal> Handle(GetCalculatedPriceQuery request, CancellationToken ct)
    {
        var product = await productRepo.GetByIdAsync(request.ProductId, ct);
        if (product == null) return 0;

        var promo = await promotionRepo.GetByProductIdAsync(request.ProductId, ct);

        if (promo == null || !promo.PromoQuantity.HasValue || !promo.PromoPrice.HasValue)
        {
            return product.Price * request.Quantity;
        }

        int promoQty = promo.PromoQuantity.Value;
        decimal promoPrice = promo.PromoPrice.Value;

        int bundles = request.Quantity / promoQty;
        int remainder = request.Quantity % promoQty;

        decimal total = (bundles * promoPrice) + (remainder * product.Price);

        return total;
    }
}