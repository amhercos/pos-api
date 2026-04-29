using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Promotions.Commands;

public class DeletePromotionHandler(
    IPosDbContext context) : IRequestHandler<DeletePromotionCommand, Unit>
{
    public async Task<Unit> Handle(DeletePromotionCommand request, CancellationToken ct)
    {
        var promos = await context.Promotions
            .Where(p => p.MainProductId == request.MainProductId)
            .ToListAsync(ct);

        if (promos.Any())
        {
            context.Promotions.RemoveRange(promos);
            await context.SaveChangesAsync(ct);
        }

        return Unit.Value;
    }
}