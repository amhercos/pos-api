using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Promotions.Commands;

public class UpdatePromotionHandler(
    IPromotionRepository promotionRepo,
    IPosDbContext context) : IRequestHandler<UpdatePromotionCommand, Unit>
{
    public async Task<Unit> Handle(UpdatePromotionCommand request, CancellationToken ct)
    {
        var promo = await promotionRepo.GetByIdAsync(request.Id, ct);
        if (promo == null) throw new KeyNotFoundException("Promotion not found");

        promo.Name = request.Name;
        promo.PromoQuantity = request.PromoQuantity;
        promo.PromoPrice = request.PromoPrice;
        promo.IsActive = request.IsActive;

        promotionRepo.Update(promo);
        await context.SaveChangesAsync(ct);
        return Unit.Value;
    }
}