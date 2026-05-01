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

            var bestPromo = activePromos
                .OrderBy(p => p.Type == PromotionType.Bundle ? 0 : 1)
                .ThenByDescending(p => p.PromoQuantity)
                .FirstOrDefault(p => p.Type != PromotionType.Bulk || (p.PromoQuantity <= quantity));

            if (bestPromo == null || !_strategyMap.TryGetValue(bestPromo.Type, out var strategy))
            {
                return Math.Round(product.Price * quantity, 2, MidpointRounding.AwayFromZero);
            }

            var total = strategy.CalculateLineTotal(product, bestPromo, quantity, basket);

            return Math.Round(total, 2, MidpointRounding.AwayFromZero);
        }
    }
}