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
            decimal bestTotal = originalTotal;

            var activePromos = product.Promotions
                .Where(p => p.IsActive && !p.IsDeleted)
                .ToList();

            if (!activePromos.Any())
            {
                return Math.Round(originalTotal, 2, MidpointRounding.AwayFromZero);
            }

            foreach (var promo in activePromos)
            {
                if (_strategyMap.TryGetValue(promo.Type, out var strategy))
                {
                    try
                    {
                        var promoTotal = strategy.CalculateLineTotal(product, promo, quantity, basket);

                        if (promoTotal < bestTotal)
                        {
                            bestTotal = promoTotal;
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }
            }

            return Math.Round(bestTotal, 2, MidpointRounding.AwayFromZero);
        }
    }
}