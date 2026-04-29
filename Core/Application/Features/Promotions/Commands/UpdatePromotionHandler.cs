using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Promotions.Commands;

public class UpdatePromotionHandler(
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<UpdatePromotionCommand, Unit>
{
    public async Task<Unit> Handle(UpdatePromotionCommand request, CancellationToken ct)
    {
        var storeId = currentUserService.StoreId;

        var existingPromos = await context.Promotions
            .Where(p => p.MainProductId == request.MainProductId && p.StoreId == storeId)
            .ToListAsync(ct);

        if (existingPromos.Any())
        {
            context.Promotions.RemoveRange(existingPromos);
        }

        foreach (var tier in request.Tiers)
        {
            var promotion = new Promotion
            {
                Id = Guid.NewGuid(),
                Name = request.Tiers.Count > 1 ? $"{request.Name} ({tier.Quantity} qty)" : request.Name,
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

            context.Promotions.Add(promotion);
        }

        await context.SaveChangesAsync(ct);
        return Unit.Value;
    }
}