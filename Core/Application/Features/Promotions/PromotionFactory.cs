using Domain.Entities;
using Domain.Entities.Enums;

namespace Application.Features.Promotions;

public static class PromotionFactory
{
    public static Promotion Create(
        string name,
        PromotionType type,
        Guid storeId,
        Guid mainProductId,
        int quantity,
        decimal price,
        Guid? tieUpId = null,
        int? tieUpQty = null)
    {
        return new Promotion
        {
            Id = Guid.NewGuid(),
            Name = name,
            Type = type,
            StoreId = storeId,
            MainProductId = mainProductId,
            PromoQuantity = quantity,
            PromoPrice = price,
            TieUpProductId = tieUpId,
            TieUpQuantity = tieUpQty,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
    }
}