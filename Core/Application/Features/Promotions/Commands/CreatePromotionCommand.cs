using Domain.Entities.Enums;
using MediatR;

namespace Application.Features.Promotions.Commands;

public record CreatePromotionCommand : IRequest<Guid>
{
    public required string Name { get; init; }
    public PromotionType Type { get; init; }
    public Guid MainProductId { get; init; }

    // Bulk Pricing
    public int? PromoQuantity { get; init; }
    public decimal? PromoPrice { get; init; }

    // Tie-up Logic
    public Guid? TieUpProductId { get; init; }
    public int? TieUpQuantity { get; init; }
}