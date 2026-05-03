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
        List<(int Quantity, decimal Price)> tiers,
        Guid? tieUpId = null,
        int? tieUpQty = null)
    {
        var promotionId = Guid.NewGuid();

        var promotion = new Promotion
        {
            Id = promotionId,
            Name = name,
            Type = type,
            StoreId = storeId,
            MainProductId = mainProductId,
            TieUpProductId = tieUpId,
            TieUpQuantity = tieUpQty,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            Tiers = new List<PromotionTier>()
        };

        foreach (var tier in tiers)
        {
            promotion.Tiers.Add(new PromotionTier
            {
                Id = Guid.NewGuid(),
                PromotionId = promotionId,
                StoreId = storeId,
                Quantity = tier.Quantity,
                Price = tier.Price
            });
        }

        return promotion;
    }
}