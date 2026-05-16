using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Promotions.Commands;

public class UpdatePromotionHandler(
    IPromotionRepository promotionRepo,
    IPosDbContext context) : IRequestHandler<UpdatePromotionCommand, Unit>
{
    public async Task<Unit> Handle(UpdatePromotionCommand request, CancellationToken ct)
    {
        var promotion = await promotionRepo.GetByIdAsync(request.Id, ct);
        if (promotion == null) throw new KeyNotFoundException("Promotion not found.");

        promotion.Name = request.Name;
        promotion.Type = request.Type;
        promotion.IsActive = request.IsActive;
        promotion.MainProductId = request.MainProductId;
        promotion.TieUpProductId = request.TieUpProductId;
        promotion.TieUpQuantity = request.TieUpQuantity;

        var incomingTiers = (request.Tiers ?? new List<UpdatePromoTierDto>())
            .GroupBy(t => t.Quantity)
            .Select(g => g.First())
            .ToList();

        var existingTiers = promotion.Tiers.ToList();

        foreach (var existing in existingTiers)
        {
            if (!incomingTiers.Any(i => i.Quantity == existing.Quantity))
            {
                context.PromotionTiers.Remove(existing);
            }
        }

        foreach (var incoming in incomingTiers)
        {
            var existing = existingTiers.FirstOrDefault(e => e.Quantity == incoming.Quantity);

            if (existing != null)
            {
                existing.Price = incoming.Price;
            }
            else
            {
                var newTier = new PromotionTier
                {
                    Id = Guid.NewGuid(),
                    PromotionId = promotion.Id,
                    StoreId = promotion.StoreId,
                    Quantity = incoming.Quantity,
                    Price = incoming.Price
                };
                context.PromotionTiers.Add(newTier);
            }
        }

        await context.SaveChangesAsync(ct);
        return Unit.Value;
    }
}