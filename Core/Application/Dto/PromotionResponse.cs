using Domain.Entities.Enums;

namespace Application.Dto;

public record PromotionResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public PromotionType Type { get; init; }
    public Guid MainProductId { get; init; }

    public string ProductName { get; init; } = string.Empty;
    public decimal OriginalPrice { get; init; }

    public List<PromoTierResponse> Tiers { get; init; } = new();

    public Guid? TieUpProductId { get; init; }
    public string? TieUpProductName { get; init; }
    public int? TieUpQuantity { get; init; }

    public bool IsActive { get; init; }
}

public record PromoTierResponse(int Quantity, decimal Price);