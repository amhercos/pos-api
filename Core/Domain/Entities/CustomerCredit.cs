using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class CustomerCredit : BaseEntity

    {
        public required string CustomerName { get; set; }
        public string? ContactInfo { get; set; }
        public decimal CreditAmount { get; set; }
        public Guid StoreId { get; set; }
        public Store Store { get; set; } = null!;
        public ICollection<CreditPayment> Payments { get; set; } = new List<CreditPayment>();
    }
}
