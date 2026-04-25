
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
    PromotionType PromotionType,
    int? PromoQuantity,
    decimal? PromoPrice,
    Guid? TieUpProductId,
    int? TieUpQuantity,
    bool IsActive
 );
}
