using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Pricing
{
    public class BulkPricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Bulk;

        public decimal CalculateLineTotal(Product product, Promotion promo, int quantity, IEnumerable<TransactionItem> basket)
        {
            var bulkTiers = product.Promotions
                .Where(p => p.IsActive && p.Type == PromotionType.Bulk)
                .OrderByDescending(p => p.PromoQuantity)
                .ToList();

            if (!bulkTiers.Any())
                return quantity * product.Price;

            decimal total = 0;
            int remainingQty = quantity;

            foreach (var tier in bulkTiers)
            {
                int threshold = tier.PromoQuantity ?? 0;
                if (threshold > 0 && remainingQty >= threshold)
                {
                    int sets = remainingQty / threshold;
                    total += sets * (tier.PromoPrice ?? 0);
                    remainingQty %= threshold;
                }
            }

            total += remainingQty * product.Price;

            return total;
        }
    }
}