using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces.Repositories
{
    public interface ICustomerCreditRepository
    {
        Task<CustomerCredit?> GetByIdAsync(Guid id, CancellationToken ct);
        void Update(CustomerCredit credit);
        void Add(CustomerCredit credit);
        void AddPayment(CreditPayment payment);
        Task <List<CustomerCredit>> GetActiveCreditsAsync(Guid storeId, CancellationToken ct);
        Task<List<CustomerCredit>> SearchByNameAsync(Guid storeId, string name, CancellationToken ct);
        Task<List<CreditPayment>> GetPaymentHistoryAsync(Guid customerCreditId, CancellationToken ct);
        Task<decimal> GetCalculatedBalanceAsync(Guid customerId, CancellationToken ct);
    }
}
