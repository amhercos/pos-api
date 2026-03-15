using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class TransactionItem : BaseEntity
    {
        public Guid StoreId { get; set; }
        public Store Store { get; set; } = null!;
        public Guid TransactionId { get; set; }
        public Transaction Transaction { get; set; }
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice => Quantity * UnitPrice;
    
    }
}
