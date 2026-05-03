using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using MediatR;

namespace Application.Features.Promotions.Commands;

public class CreatePromotionHandler(
    IPromotionRepository promotionRepo,
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<CreatePromotionCommand, Unit>
{
    public async Task<Unit> Handle(CreatePromotionCommand request, CancellationToken ct)
    {
        var storeId = currentUserService.StoreId;

        var promotion = new Promotion
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type,
            StoreId = storeId,
            MainProductId = request.MainProductId,
            TieUpProductId = request.TieUpProductId,
            TieUpQuantity = request.TieUpQuantity,
            IsActive = true
        };

        var distinctTiers = request.Tiers
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

        promotion.Tiers = distinctTiers;
        promotionRepo.Add(promotion);

        await context.SaveChangesAsync(ct);
        return Unit.Value;
    }
}