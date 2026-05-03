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
            if (!promo.IsActive || promo.TieUpProductId == null || promo.Tiers == null || !promo.Tiers.Any())
            {
                return quantity * product.Price;
            }

            var bundleTier = promo.Tiers.OrderBy(t => t.Quantity).FirstOrDefault();
            decimal bundlePrice = bundleTier?.Price ?? product.Price;

            var tieUpItem = basket.FirstOrDefault(i => i.ProductId == promo.TieUpProductId);
            int tieUpInCart = tieUpItem?.Quantity ?? 0;

            int applicableBundleCount = Math.Min(quantity, tieUpInCart);
            int regularPriceCount = quantity - applicableBundleCount;

            return (applicableBundleCount * bundlePrice) + (regularPriceCount * product.Price);
        }
    }
}