using Domain.Entities.Enums;
using MediatR;

namespace Application.Features.Promotions.Commands;

public record PromoTier(int Quantity, decimal Price);

public record CreatePromotionCommand : IRequest<Unit>
{
    public required string Name { get; init; }
    public PromotionType Type { get; init; }
    public Guid MainProductId { get; init; }

    public List<PromoTier> Tiers { get; init; } = new();

    // Tie-up Logic (Optional)
    public Guid? TieUpProductId { get; init; }
    public int? TieUpQuantity { get; init; }
}