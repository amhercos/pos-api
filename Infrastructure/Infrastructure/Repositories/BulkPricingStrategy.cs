using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repositories
{
    // Bulk Pricing
    public class BulkPricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Bulk;
        public decimal Calculate(Product product, Promotion promo, int quantity)
        {
            int promoQty = promo.PromoQuantity ?? 1;
            int bundles = quantity / promoQty;
            int remainder = quantity % promoQty;
            return (bundles * (promo.PromoPrice ?? 0)) + (remainder * product.Price);
        }
    }

    // Discount
    public class DiscountPricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Discount;
        public decimal Calculate(Product product, Promotion promo, int quantity)
        {
            return (promo.PromoPrice ?? product.Price) * quantity;
        }
    }

    // Tie Up
    public class BundlePricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Bundle;
        public decimal Calculate(Product product, Promotion promo, int quantity)
        {
            if (quantity >= (promo.PromoQuantity ?? 1))
                return (promo.PromoPrice ?? product.Price) * quantity;

            return product.Price * quantity;
        }
    }
}