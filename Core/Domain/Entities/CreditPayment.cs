using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class CreditPayment : BaseEntity
    {
        public Guid StoreId { get; set; }
        public Store Store { get; set; } = null!;  
        public Guid CustomerCreditId { get; set; }
        public CustomerCredit CustomerCredit { get; set; } = null!;
        public decimal AmountPaid { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public decimal RemainingCredit => CustomerCredit.CreditAmount - AmountPaid;
    }
}
