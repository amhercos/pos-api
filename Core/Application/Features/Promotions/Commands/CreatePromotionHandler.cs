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

        if (request.Type == PromotionType.Bulk && request.Tiers.Any())
        {
            foreach (var tier in request.Tiers)
            {
                var promo = PromotionFactory.Create(
                    name: $"{request.Name} ({tier.Quantity} qty)",
                    type: request.Type,
                    storeId: storeId,
                    mainProductId: request.MainProductId,
                    quantity: tier.Quantity,
                    price: tier.Price
                );
                promotionRepo.Add(promo);
            }
        }
        else
        {
            // Handle Discount or Bundle
            var firstTier = request.Tiers.FirstOrDefault();
            var promo = PromotionFactory.Create(
                name: request.Name,
                type: request.Type,
                storeId: storeId,
                mainProductId: request.MainProductId,
                quantity: firstTier?.Quantity ?? 1,
                price: firstTier?.Price ?? 0,
                tieUpId: request.TieUpProductId,
                tieUpQty: request.TieUpQuantity
            );
            promotionRepo.Add(promo);
        }

        await context.SaveChangesAsync(ct);
        return Unit.Value;
    }
}