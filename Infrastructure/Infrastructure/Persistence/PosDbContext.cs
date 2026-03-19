using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Persistence
{
    public class PosDbContext(
        DbContextOptions<PosDbContext> options,
        ICurrentUserService currentUserService)
        : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options), IPosDbContext
    {
        private IDbContextTransaction? _currentTransaction;

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Transaction> Transactions => Set<Transaction>();
        public DbSet<TransactionItem> TransactionItems => Set<TransactionItem>();
        public DbSet<CustomerCredit> CustomerCredits => Set<CustomerCredit>();
        public DbSet<CreditPayment> CreditPayments => Set<CreditPayment>();
        public DbSet<Store> Stores => Set<Store>();
        public DbSet<StoreSettings> StoresSettings => Set<StoreSettings>();


        public async Task BeginTransactionAsync(CancellationToken cancellationToken)
        {
            _currentTransaction = await Database.BeginTransactionAsync(cancellationToken);
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken)
        {
            try
            {
                await SaveChangesAsync(cancellationToken);
                if (_currentTransaction != null) await _currentTransaction.CommitAsync(cancellationToken);
            }
            finally
            {
                _currentTransaction?.Dispose();
                _currentTransaction = null;
            }
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken)
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.RollbackAsync(cancellationToken);
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.HasPostgresExtension("uuid-ossp");
            builder.ApplyConfigurationsFromAssembly(typeof(PosDbContext).Assembly);

            builder.Entity<Category>().HasQueryFilter(c => c.StoreId == currentUserService.StoreId);
            builder.Entity<Product>().HasQueryFilter(p => p.StoreId == currentUserService.StoreId);
            builder.Entity<Transaction>().HasQueryFilter(t => t.StoreId == currentUserService.StoreId);
            builder.Entity<CustomerCredit>().HasQueryFilter(cc => cc.StoreId == currentUserService.StoreId);
            builder.Entity<TransactionItem>().HasQueryFilter(ti => ti.StoreId == currentUserService.StoreId);
            builder.Entity<CreditPayment>().HasQueryFilter(cp => cp.StoreId == currentUserService.StoreId);

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                var properties = entityType.GetProperties()
                    .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?));

                foreach (var property in properties)
                {
                    property.SetPrecision(18);
                    property.SetScale(2);
                }
            }
        }
    }
}