using Domain.Entities;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces.Repositories
{
    public interface IPricingStrategy
    {
        PromotionType Type { get; }
        decimal CalculateLineTotal(Product product, Promotion promo, int quantity, IEnumerable<TransactionItem> basket);
    }
}
