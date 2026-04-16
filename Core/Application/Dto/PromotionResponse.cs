namespace Application.Features.Promotions.Queries;

public record PromotionResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal OriginalPrice { get; init; }
    public decimal PromoPrice { get; init; }
    public int? PromoQuantity { get; init; }
    public bool IsActive { get; init; }
}