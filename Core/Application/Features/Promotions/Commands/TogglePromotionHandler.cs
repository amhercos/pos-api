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
        var tiers = await promotionRepo.GetByMainProductIdAsync(request.MainProductId, ct);

        if (!tiers.Any()) throw new KeyNotFoundException("Promotion group not found");

        bool newStatus = !tiers.First().IsActive;

        foreach (var tier in tiers)
        {
            tier.IsActive = newStatus;
            promotionRepo.Update(tier);
        }

        await context.SaveChangesAsync(ct);
        return newStatus;
    }
}