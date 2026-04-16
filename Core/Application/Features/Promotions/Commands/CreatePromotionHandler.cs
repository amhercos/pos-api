using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;

namespace Application.Features.Promotions.Commands;

public class CreatePromotionHandler(
    IPromotionRepository promotionRepo,
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<CreatePromotionCommand, Guid>
{
    public async Task<Guid> Handle(CreatePromotionCommand request, CancellationToken ct)
    {
        var authenticatedStoreId = currentUserService.StoreId;

        if (authenticatedStoreId == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Invalid Store");
        }

        var promotion = new Promotion
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type,
            StoreId = authenticatedStoreId,
            MainProductId = request.MainProductId,
            PromoQuantity = request.PromoQuantity,
            PromoPrice = request.PromoPrice,
            TieUpProductId = request.TieUpProductId,
            TieUpQuantity = request.TieUpQuantity,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        promotionRepo.Add(promotion);
        await context.SaveChangesAsync(ct);

        return promotion.Id;
    }
}