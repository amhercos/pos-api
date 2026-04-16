using MediatR;

namespace Application.Features.Promotions.Commands;

public record UpdatePromotionCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public int? PromoQuantity { get; init; }
    public decimal? PromoPrice { get; init; }
    public bool IsActive { get; init; }
}