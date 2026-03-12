using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class CreditPayment : BaseEntity
    {
        public Guid CustomerCreditId { get; set; }
        public CustomerCredit CustomerCredit { get; set; }
        public decimal AmountPaid { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.Now;
        public decimal RemainingCredit => CustomerCredit.CreditAmount - AmountPaid;
    }
}
