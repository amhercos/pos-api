using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Pricing
{
    public class BundlePricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Bundle;

        public decimal CalculateLineTotal(Product product, Promotion promo, int quantity, IEnumerable<TransactionItem> basket)
        {
            if (promo.TieUpProductId == null)
                return product.Price * quantity;

            var tieUpItem = basket.FirstOrDefault(i => i.ProductId == promo.TieUpProductId);
            int tieUpAvailable = tieUpItem?.Quantity ?? 0;

            int applicableBundleCount = Math.Min(quantity, tieUpAvailable);
            int regularPriceCount = quantity - applicableBundleCount;

            decimal bundlePrice = promo.PromoPrice ?? product.Price;

            return (applicableBundleCount * bundlePrice) + (regularPriceCount * product.Price);
        }
    }
}