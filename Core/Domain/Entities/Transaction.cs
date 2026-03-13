using Domain.Entities.Common;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Transaction : BaseEntity
    {
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public PaymentType PaymentType { get; set; }
        public Guid UserId  { get; set; }
        public User User { get; set; } = null!;

        public ICollection<TransactionItem> Items { get; set; } = new List<TransactionItem>();
        public Guid CustomerCreditId { get; set; }
    }
}
