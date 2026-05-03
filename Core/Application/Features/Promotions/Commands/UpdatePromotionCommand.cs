using Domain.Entities.Enums;
using MediatR;

public record UpdatePromotionCommand : IRequest<Unit>
{
    public Guid Id { get; init; }
    public Guid MainProductId { get; init; }
    public required string Name { get; init; }
    public PromotionType Type { get; init; }
    public bool IsActive { get; init; }

    public List<UpdatePromoTierDto> Tiers { get; init; } = new();

    public Guid? TieUpProductId { get; init; }
    public int? TieUpQuantity { get; init; }
}

public record UpdatePromoTierDto(int Quantity, decimal Price);