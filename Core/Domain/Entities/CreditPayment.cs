using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class CreditPayment : BaseEntity , ITenantEntity
    {
        public Guid? LocalId { get; set; }
        public bool IsOfflineSync { get; set; }
        public Guid StoreId { get; set; }
        public Store Store { get; set; } = null!;  
        public Guid CustomerCreditId { get; set; }
        public CustomerCredit CustomerCredit { get; set; } = null!;
        public decimal AmountPaid { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal RemainingCredit => CustomerCredit.CreditAmount - AmountPaid;
    }
}
