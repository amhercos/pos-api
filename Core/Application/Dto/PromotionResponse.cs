using Application.Features.Promotions.Commands;
using Domain.Entities.Enums;

namespace Application.Dto;
public record PromotionResponse
{
    public Guid MainProductId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal OriginalPrice { get; init; }
    public bool IsActive { get; init; }
    public PromotionType Type { get; init; }

    public List<PromoTier> Tiers { get; init; } = new();
    public Guid? TieUpProductId { get; init; }

    //  Tie-up info
    public string? TieUpProductName { get; init; }
}