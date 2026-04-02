using Domain.Entities.Common;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Transaction : BaseEntity
    {
        public DateTime TransactionDate { get; set; } 
        public decimal TotalAmount { get; set; }
        public PaymentType PaymentType { get; set; }
        public Guid UserId  { get; set; }
        public User User { get; set; } = null!;
        public Guid  StoreId { get; set; }
        public Store Store { get; set; } = null!;

        public decimal CashReceived { get; set; }
        public decimal ChangeAmount { get; set; }

        public ICollection<TransactionItem> Items { get; set; } = new List<TransactionItem>();
        public Guid? CustomerCreditId { get; set; }
        public CustomerCredit CustomerCredit { get; set; } = null!;

        public bool IsOfflineSync { get; set; }
        public Guid? LocalId { get; set; }
    }
}
