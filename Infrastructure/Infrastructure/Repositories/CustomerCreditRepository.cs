using Application.Dto;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repositories
{
    public class CustomerCreditRepository(PosDbContext context) : ICustomerCreditRepository
    {
        public async Task<List<CustomerCredit>> GetActiveCreditsAsync(Guid storeId, bool includeSettled, CancellationToken ct)
        {
            var query = context.CustomerCredits
                .AsNoTracking()
                .Where(c => c.StoreId == storeId);

            if (includeSettled)
            {
                query = query.Where(c => c.Status == CreditStatus.Active || c.Status == CreditStatus.Settled);
            }
            else
            {
                query = query.Where(c => c.Status == CreditStatus.Active);
            }

            return await query.ToListAsync(ct);
        }
        public async Task<CustomerCredit?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            return await context.CustomerCredits
            .Include(c => c.Payments)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
        }

        public async Task<List<CustomerCredit>> SearchByNameAsync(Guid storeId, string name, CancellationToken ct)
        {
            return await context.CustomerCredits
            .AsNoTracking()
            .Where(c => c.StoreId == storeId && 
                   c.CustomerName.ToLower().Contains(name.ToLower()))
            .OrderBy(c => c.CustomerName)
            .Take(5)
            .ToListAsync(ct);

        }
        public void Update(CustomerCredit credit) => context.CustomerCredits.Update(credit);
        public void Add(CustomerCredit credit) => context.CustomerCredits.Add(credit);

        public void AddPayment(CreditPayment payment) => context.CreditPayments.Add(payment);

        public async Task<List<CreditPayment>> GetPaymentHistoryAsync(Guid customerCreditId, CancellationToken ct)
        {
            return await context.CreditPayments
            .AsNoTracking() 
            .Where(p => p.CustomerCreditId == customerCreditId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(ct);
        }

        public async Task<decimal> GetCalculatedBalanceAsync(Guid customerId, CancellationToken ct)
        {
            var totalPurchased = await context.Transactions
                .Where(t => t.CustomerCreditId == customerId)
                .SumAsync(t => (decimal?)t.TotalAmount, ct) ?? 0;

            var totalPaid = await context.CreditPayments
                .Where(p => p.CustomerCreditId == customerId)
                .SumAsync(p => (decimal?)p.AmountPaid, ct) ?? 0;

            return totalPurchased - totalPaid;
        }

        public async Task<decimal> GetTotalCollectedAsync(Guid storeId, DateTime? startDate, CancellationToken ct)
        {
            var query = context.CreditPayments
                .AsNoTracking()
                .Where(p => p.StoreId == storeId);

            if (startDate.HasValue)
            {
                query = query.Where(p => p.PaymentDate >= startDate.Value);
            }

            return await query.Select(p => p.AmountPaid).SumAsync(ct);
        }

        public async Task<decimal> GetTotalActiveDebtsAsync(Guid storeId, CancellationToken ct)
        {
            return await context.CustomerCredits
                .AsNoTracking()
                .Where(c => c.StoreId == storeId)
                .Select(c => c.CreditAmount)
                .SumAsync(ct);
        }
    }
}
