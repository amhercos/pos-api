using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Promotions.Commands;

public class TogglePromotionHandler(
    IPromotionRepository promotionRepo,
    IPosDbContext context) : IRequestHandler<TogglePromotionCommand, bool>
{
    public async Task<bool> Handle(TogglePromotionCommand request, CancellationToken ct)
    {
        var promotion = await promotionRepo.GetByProductIdAsync(request.MainProductId, ct);

        if (promotion == null)
            throw new KeyNotFoundException("Promotion for this product not found");

        promotion.IsActive = !promotion.IsActive;

        promotionRepo.Update(promotion);
        await context.SaveChangesAsync(ct);

        return promotion.IsActive;
    }
}