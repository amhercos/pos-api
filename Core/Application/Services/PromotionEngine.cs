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
            var activePromo = product.Promotions.FirstOrDefault(p => p.IsActive);
            if (activePromo == null || !_strategyMap.TryGetValue(activePromo.Type, out var strategy))
            {
                return Math.Round(product.Price * quantity, 2, MidpointRounding.AwayFromZero);
            }

            var total = strategy.CalculateLineTotal(product, activePromo, quantity, basket);

            return Math.Round(total, 2, MidpointRounding.AwayFromZero);
        }
    }
}