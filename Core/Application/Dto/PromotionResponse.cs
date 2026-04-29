using Application.Features.Promotions.Commands;

namespace Application.Dto;
public record PromotionResponse
{
    public Guid MainProductId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal OriginalPrice { get; init; }
    public bool IsActive { get; init; }

    public List<PromoTier> Tiers { get; init; } = new();

    //  Tie-up info
    public string? TieUpProductName { get; init; }
}