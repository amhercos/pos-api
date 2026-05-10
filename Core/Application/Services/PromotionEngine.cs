using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;

namespace Application.Services
{
    public class PromotionEngine : IPromotionEngine
    {
        private readonly Dictionary<PromotionType, IPricingStrategy> _strategyMap;

        public PromotionEngine(IEnumerable<IPricingStrategy> strategies)
        {
            _strategyMap = strategies.ToDictionary(s => s.Type);
        }

        public decimal CalculateLineTotal(Product product, int quantity, IEnumerable<TransactionItem> basket)
        {
            decimal originalTotal = product.Price * quantity;

            var promo = product.Promotions
                .FirstOrDefault(p => p.IsActive && !p.IsDeleted);

            if (promo == null || !_strategyMap.TryGetValue(promo.Type, out var strategy))
            {
                return Math.Round(originalTotal, 2, MidpointRounding.AwayFromZero);
            }

            try
            {
                var promoTotal = strategy.CalculateLineTotal(product, promo, quantity, basket);
                return Math.Round(Math.Min(promoTotal, originalTotal), 2, MidpointRounding.AwayFromZero);
            }
            catch
            {
                return Math.Round(originalTotal, 2, MidpointRounding.AwayFromZero);
            }
        }
    }
}