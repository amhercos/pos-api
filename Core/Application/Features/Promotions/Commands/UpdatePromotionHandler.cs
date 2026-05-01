using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Promotions.Commands;

public class UpdatePromotionHandler(
    IPromotionRepository promotionRepo, // Use Repo instead of Context
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<UpdatePromotionCommand, Unit>
{
    public async Task<Unit> Handle(UpdatePromotionCommand request, CancellationToken ct)
    {
        var storeId = currentUserService.StoreId;

        var existingTiers = await promotionRepo.GetByMainProductIdAsync(request.MainProductId, ct);

        if (existingTiers.Any())
        {
            promotionRepo.RemoveRange(existingTiers);
        }

        var sortedTiers = request.Tiers.OrderByDescending(t => t.Quantity);

        foreach (var tier in sortedTiers)
        {
            var promotion = new Promotion
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Type = request.Type,
                StoreId = storeId,
                MainProductId = request.MainProductId,
                PromoQuantity = tier.Quantity,
                PromoPrice = tier.Price,
                TieUpProductId = request.TieUpProductId,
                TieUpQuantity = request.TieUpQuantity,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            promotionRepo.Add(promotion);
        }

        await context.SaveChangesAsync(ct);
        return Unit.Value;
    }
}