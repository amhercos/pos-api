using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Application.Services.Pricing
{
    public class BulkPricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Bulk;

        public decimal CalculateLineTotal(Product product, Promotion promo, int quantity, IEnumerable<TransactionItem> basket)
        {
            if (promo.Tiers == null || !promo.Tiers.Any())
                return quantity * product.Price;

            decimal total = 0;
            int remainingQuantity = quantity;

            var sortedTiers = promo.Tiers.OrderByDescending(t => t.Quantity).ToList();

            foreach (var tier in sortedTiers)
            {
                if (remainingQuantity >= tier.Quantity)
                {
                    int numberOfPacks = remainingQuantity / tier.Quantity;
                    total += numberOfPacks * Math.Round(tier.Quantity * tier.Price, 2, MidpointRounding.AwayFromZero);
                    remainingQuantity %= tier.Quantity;
                }
            }

            total += (remainingQuantity * product.Price);

            return total;
        }
    }
}