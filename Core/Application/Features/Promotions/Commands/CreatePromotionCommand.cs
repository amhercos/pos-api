using Domain.Entities.Enums;
using MediatR;

public record CreatePromotionCommand : IRequest<Unit>
{
    public string Name { get; init; } = string.Empty;
    public PromotionType Type { get; init; }
    public Guid MainProductId { get; init; }
    public bool IsActive { get; init; }
    public List<PromoTierRequest> Tiers { get; init; } = new();
    public Guid? TieUpProductId { get; init; }
    public int? TieUpQuantity { get; init; }
}

public record PromoTierRequest(int Quantity, decimal Price);