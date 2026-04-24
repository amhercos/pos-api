using Domain.Entities;
using Domain.Entities.Enums;
using Application.Interfaces;

namespace Application.Services
{
    public class PromotionEngine : IPromotionEngine
    {
        public decimal CalculateUnitPrice(Product product, int quantity, IEnumerable<TransactionItem> basket)
        {
            var activePromo = product.Promotions
                .Where(p => p.IsActive)
                .OrderBy(p => p.Type)
                .FirstOrDefault();

            if (activePromo == null) return product.Price;

            return activePromo.Type switch
            {
                PromotionType.Discount => activePromo.PromoPrice ?? product.Price,
                PromotionType.Bulk => ApplyBulkPricing(activePromo, quantity, product.Price),
                PromotionType.Bundle => ApplyBundlePricing(activePromo, basket, product.Price),
                _ => product.Price
            };
        }

        private decimal ApplyBulkPricing(Promotion promo, int qty, decimal originalPrice)
        {
            if (qty >= (promo.PromoQuantity ?? 0))
                return (promo.PromoPrice ?? 0) / (promo.PromoQuantity ?? 1);
            return originalPrice;
        }

        private decimal ApplyBundlePricing(Promotion promo, IEnumerable<TransactionItem> basket, decimal originalPrice)
        {
            bool hasTieUp = basket.Any(i => i.ProductId == promo.TieUpProductId && i.Quantity >= (promo.TieUpQuantity ?? 1));
            return hasTieUp ? (promo.PromoPrice ?? originalPrice) : originalPrice;
        }
    }
}
