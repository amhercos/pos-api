using Domain.Entities.Enums;

namespace Application.Dto
{
    public record ProductDto(
        Guid Id,
        string Name,
        string? Description,
        decimal Price,
        int StockQuantity,
        int LowStockThreshold,
        string CategoryName,
        DateOnly? ExpiryDate,
        Guid? CategoryId,
        List<PromotionDto>? Promotions = null
    );

    public record PromotionDto(
        Guid Id,
        string Name,
        PromotionType PromotionType,
        bool IsActive,
        List<PromoTierDto> Tiers,
        Guid? TieUpProductId = null,
        int? TieUpQuantity = null
    );

    public record PromoTierDto(
        int Quantity,
        decimal Price
    );
}