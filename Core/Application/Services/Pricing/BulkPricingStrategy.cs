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

            var applicableTier = promo.Tiers
                .Where(t => quantity >= t.Quantity)
                .OrderByDescending(t => t.Quantity)
                .FirstOrDefault();

            if (applicableTier == null)
                return quantity * product.Price;

            return quantity * applicableTier.Price;
        }
    }
}