using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;

namespace Application.Features.Promotions.Commands;

public class UpdatePromotionHandler(
    IPromotionRepository promotionRepo,
    IPosDbContext context) : IRequestHandler<UpdatePromotionCommand, Unit>
{
    public async Task<Unit> Handle(UpdatePromotionCommand request, CancellationToken ct)
    {
        var promotion = await promotionRepo.GetByIdAsync(request.Id, ct);
        if (promotion == null) throw new KeyNotFoundException("Promotion not found.");

        if (promotion.MainProductId != request.MainProductId)
        {
            var existingForNewProduct = await promotionRepo.GetByMainProductIdAsync(request.MainProductId, ct);
            if (existingForNewProduct.Any())
            {
                promotionRepo.RemoveRange(existingForNewProduct);
            }
        }

        promotion.Name = request.Name;
        promotion.Type = request.Type;
        promotion.IsActive = request.IsActive;
        promotion.MainProductId = request.MainProductId;
        promotion.TieUpProductId = request.TieUpProductId;
        promotion.TieUpQuantity = request.TieUpQuantity;

        if (promotion.Tiers.Any())
        {
            context.PromotionTiers.RemoveRange(promotion.Tiers);
            promotion.Tiers.Clear();
        }

        if (request.Tiers != null && request.Tiers.Any())
        {
            var newTiers = request.Tiers
                .GroupBy(t => t.Quantity)
                .Select(g => g.First())
                .Select(t => new PromotionTier
                {
                    Id = Guid.NewGuid(),
                    PromotionId = promotion.Id,
                    StoreId = promotion.StoreId,
                    Quantity = t.Quantity,
                    Price = t.Price
                }).ToList();

            foreach (var tier in newTiers)
            {
                promotion.Tiers.Add(tier);
            }
        }

        promotionRepo.Update(promotion);
        await context.SaveChangesAsync(ct);

        return Unit.Value;
    }
}