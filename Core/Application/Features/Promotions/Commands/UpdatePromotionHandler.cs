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

        if (promotion == null)
            throw new Exception("Promotion not found.");

        var storeId = promotion.StoreId;

        promotion.Name = request.Name;
        promotion.Type = request.Type;
        promotion.IsActive = request.IsActive;
        promotion.MainProductId = request.MainProductId;
        promotion.TieUpProductId = request.TieUpProductId;
        promotion.TieUpQuantity = request.TieUpQuantity;

   
        promotion.Tiers.Clear();

        var newTiers = request.Tiers
            .GroupBy(t => t.Quantity)
            .Select(g => g.First())
            .Select(t => new PromotionTier
            {
                Id = Guid.NewGuid(),
                PromotionId = promotion.Id,
                StoreId = storeId,
                Quantity = t.Quantity,
                Price = t.Price
            }).ToList();

        foreach (var tier in newTiers)
        {
            promotion.Tiers.Add(tier);
        }

        promotionRepo.Update(promotion);
        await context.SaveChangesAsync(ct);

        return Unit.Value;
    }
}