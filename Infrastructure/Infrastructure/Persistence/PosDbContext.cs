using Application.Interfaces;
using Domain.Entities;
using Domain.Entities.Common;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Persistence
{
    public class PosDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IPosDbContext
    {
        private readonly ICurrentUserService _currentUserService;
        private IDbContextTransaction? _currentTransaction;

        public PosDbContext(
            DbContextOptions options,
            ICurrentUserService currentUserService)
            : base(options)
        {
            _currentUserService = currentUserService;
        }

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Transaction> Transactions => Set<Transaction>();
        public DbSet<TransactionItem> TransactionItems => Set<TransactionItem>();
        public DbSet<CustomerCredit> CustomerCredits => Set<CustomerCredit>();
        public DbSet<CreditPayment> CreditPayments => Set<CreditPayment>();
        public DbSet<Store> Stores => Set<Store>();
        public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();

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

            // tenant isolation
            builder.Entity<Category>().Ignore(c => c.Store);
            builder.Entity<Product>().Ignore(p => p.Store);
            builder.Entity<Transaction>().Ignore(t => t.User);
            builder.Entity<User>().Ignore(u => u.Store);
            builder.Entity<CustomerCredit>().Ignore(cc => cc.Store);
            builder.Entity<TransactionItem>().Ignore(ti => ti.Store);
            builder.Entity<CreditPayment>().Ignore(cp => cp.Store);

            // global query filters for tenant isolation
            builder.Entity<Category>().HasQueryFilter(c => c.StoreId == _currentUserService.StoreId);
            builder.Entity<Product>().HasQueryFilter(p => p.StoreId == _currentUserService.StoreId && !p.IsDeleted);
            builder.Entity<Transaction>().HasQueryFilter(t => t.StoreId == _currentUserService.StoreId);
            builder.Entity<CustomerCredit>().HasQueryFilter(cc => cc.StoreId == _currentUserService.StoreId);
            builder.Entity<TransactionItem>().HasQueryFilter(ti => ti.StoreId == _currentUserService.StoreId);
            builder.Entity<CreditPayment>().HasQueryFilter(cp => cp.StoreId == _currentUserService.StoreId);

            builder.Entity<Product>()
                   .ToTable(t => t.HasCheckConstraint("CK_Product_Stock_NonNegative", "\"Stock\" >= 0"));
                
            // decimal 
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