using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Promotions.Commands;

public class TogglePromotionHandler(
    IPromotionRepository promotionRepo,
    IPosDbContext context) : IRequestHandler<TogglePromotionCommand, bool>
{
    public async Task<bool> Handle(TogglePromotionCommand request, CancellationToken ct)
    {
        var promo = await promotionRepo.GetByIdAsync(request.Id, ct);
        if (promo == null) throw new KeyNotFoundException("Promotion not found");

        promo.IsActive = !promo.IsActive;

        promotionRepo.Update(promo);
        await context.SaveChangesAsync(ct);

        return promo.IsActive;
    }
}