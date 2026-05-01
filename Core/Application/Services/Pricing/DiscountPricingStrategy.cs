using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;

namespace Application.Services.Pricing
{
    public class DiscountPricingStrategy : IPricingStrategy
    {
        public PromotionType Type => PromotionType.Discount;

        public decimal CalculateLineTotal(Product product, Promotion promo, int quantity, IEnumerable<TransactionItem> basket)
        {
            if (!promo.IsActive)
            {
                return quantity * product.Price;
            }

            decimal unitPrice = promo.PromoPrice ?? product.Price;

            return unitPrice * quantity;
        }
    }
}