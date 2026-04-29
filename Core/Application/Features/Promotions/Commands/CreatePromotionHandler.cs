using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;

namespace Application.Features.Promotions.Commands;

public class CreatePromotionHandler(
    IPromotionRepository promotionRepo,
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<CreatePromotionCommand, Unit>
{
    public async Task<Unit> Handle(CreatePromotionCommand request, CancellationToken ct)
    {
        var authenticatedStoreId = currentUserService.StoreId;

        if (authenticatedStoreId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Invalid Store");
        }

        foreach (var tier in request.Tiers)
        {
            var promotion = new Promotion
            {
                Id = Guid.NewGuid(),
                Name = request.Tiers.Count > 1 ? $"{request.Name} ({tier.Quantity} qty)" : request.Name,
                Type = request.Type,
                StoreId = authenticatedStoreId,
                MainProductId = request.MainProductId,

                // Tier-specific data
                PromoQuantity = tier.Quantity,
                PromoPrice = tier.Price,

                // Shared data for this command
                TieUpProductId = request.TieUpProductId,
                TieUpQuantity = request.TieUpQuantity,

                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            promotionRepo.Add(promotion);
        }

        await context.SaveChangesAsync(ct);

        return Unit.Value;
    }
}