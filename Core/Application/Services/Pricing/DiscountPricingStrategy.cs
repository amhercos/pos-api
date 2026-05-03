using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using System.Linq;

namespace Application.Services.Pricing
{
    public class DiscountPricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Discount;

        public decimal CalculateLineTotal(Product product, Promotion promo, int quantity, IEnumerable<TransactionItem> basket)
        {
            if (!promo.IsActive || promo.Tiers == null || !promo.Tiers.Any())
            {
                return quantity * product.Price;
            }

            var discountTier = promo.Tiers.OrderBy(t => t.Quantity).FirstOrDefault();
            decimal unitPrice = discountTier?.Price ?? product.Price;

            return unitPrice * quantity;
        }
    }
}