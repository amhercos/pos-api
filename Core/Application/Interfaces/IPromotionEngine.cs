using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IPromotionEngine
    {
        decimal CalculateUnitPrice(Product product, int quantity, IEnumerable<TransactionItem> basket);
    }
}
