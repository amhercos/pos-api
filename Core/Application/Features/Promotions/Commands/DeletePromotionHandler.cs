using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Promotions.Commands;

public class DeletePromotionHandler(
    IPromotionRepository promotionRepo,
    IPosDbContext context) : IRequestHandler<DeletePromotionCommand, Unit>
{
    public async Task<Unit> Handle(DeletePromotionCommand request, CancellationToken ct)
    {
        var promo = await promotionRepo.GetByIdAsync(request.Id, ct);
        if (promo != null)
        {
            promotionRepo.Remove(promo);
            await context.SaveChangesAsync(ct);
        }
        return Unit.Value;
    }
}