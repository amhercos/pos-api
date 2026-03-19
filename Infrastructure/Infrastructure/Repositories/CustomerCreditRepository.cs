using Application.Dto;
using Application.Interfaces.Repositories;
using Domain.Entities;
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
        public async Task<List<CustomerCredit>> GetStoreCreditsAsync(Guid storeId, CancellationToken ct)
        {
            return await context.CustomerCredits
                .AsNoTracking() 
                .Where(c => c.StoreId == storeId)
                .OrderByDescending(c => c.CreditAmount)
                .ToListAsync(ct);
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
    }
}
