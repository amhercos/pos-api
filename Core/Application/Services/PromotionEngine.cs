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
            var activePromos = product.Promotions.Where(p => p.IsActive).ToList();

            if (!activePromos.Any())
            {
                return Math.Round(product.Price * quantity, 2, MidpointRounding.AwayFromZero);
            }

            var primaryType = activePromos.First().Type;

            if (!_strategyMap.TryGetValue(primaryType, out var strategy))
            {
                return Math.Round(product.Price * quantity, 2, MidpointRounding.AwayFromZero);
            }

            var total = strategy.CalculateLineTotal(product, activePromos.First(), quantity, basket);

            return Math.Round(total, 2, MidpointRounding.AwayFromZero);
        }
    }
}