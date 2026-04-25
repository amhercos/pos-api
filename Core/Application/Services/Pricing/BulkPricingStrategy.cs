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
            int threshold = promo.PromoQuantity ?? 1;
            decimal promoPrice = promo.PromoPrice ?? product.Price;

            if (quantity >= threshold)
            {
                int sets = quantity / threshold;
                int remainder = quantity % threshold;
                return (sets * promoPrice) + (remainder * product.Price);
            }
            return quantity * product.Price;
        }
    }
}
