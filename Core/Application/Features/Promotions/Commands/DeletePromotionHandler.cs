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
        var promotion = await promotionRepo.GetByProductIdAsync(request.MainProductId, ct);

        if (promotion != null)
        {
            promotionRepo.Remove(promotion);
            await context.SaveChangesAsync(ct);
        }

        return Unit.Value;
    }
}