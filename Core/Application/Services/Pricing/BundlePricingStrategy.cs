using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Application.Services.Pricing
{
    public class BundlePricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Bundle;

        public decimal CalculateLineTotal(Product product, Promotion promo, int quantity, IEnumerable<TransactionItem> basket)
        {
            if (!promo.IsActive || promo.TieUpProductId == null)
            {
                return quantity * product.Price;
            }

            var tieUpItem = basket.FirstOrDefault(i => i.ProductId == promo.TieUpProductId);
            int tieUpInCart = tieUpItem?.Quantity ?? 0;

            int applicableBundleCount = Math.Min(quantity, tieUpInCart);
            int regularPriceCount = quantity - applicableBundleCount;

            decimal bundlePrice = promo.PromoPrice ?? product.Price;

            return (applicableBundleCount * bundlePrice) + (regularPriceCount * product.Price);
        }
    }
}