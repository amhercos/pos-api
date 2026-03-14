using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IPosDbContext
    {
        DbSet<User> Users { get; }
        DbSet<Category> Categories { get; }
        DbSet<Product> Products { get; }
        DbSet<Transaction> Transactions { get; }
        DbSet<TransactionItem> TransactionItems { get; }
        DbSet<CustomerCredit> CustomerCredits { get; }
        DbSet<CreditPayment> CreditPayments { get; }
        DbSet<Store> Stores { get; }
        DbSet<StoreSettings> StoresSettings { get; }

        Task <int> SaveChangesAsync (CancellationToken cancellationToken);
        Task BeginTransactionAsync(CancellationToken cancellationToken);
        Task CommitTransactionAsync(CancellationToken cancellationToken);
        Task RollbackTransactionAsync(CancellationToken cancellationToken);


    }
}
