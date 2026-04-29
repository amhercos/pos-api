using Domain.Entities.Enums;
using MediatR;

namespace Application.Features.Promotions.Commands;

public record UpdatePromotionCommand : IRequest<Unit>
{
    public Guid MainProductId { get; init; }
    public required string Name { get; init; }
    public PromotionType Type { get; init; }
    public bool IsActive { get; init; }

    public List<PromoTier> Tiers { get; init; } = new();

    // Optional Tie-up fields
    public Guid? TieUpProductId { get; init; }
    public int? TieUpQuantity { get; init; }
}