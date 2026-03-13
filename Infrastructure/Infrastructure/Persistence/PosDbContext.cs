using Domain.Entities;
using Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace Infrastructure.Persistence
{
    public class PosDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IPosDbContext
    {
        public PosDbContext(DbContextOptions options) : base(options) { }


        public DbSet<Category> Categories => Set<Category>();

        public DbSet<Product> Products => Set<Product>();

        public DbSet<Transaction> Transactions => Set<Transaction>();

        public DbSet<TransactionItem> TransactionItems => Set<TransactionItem>();

        public DbSet<CustomerCredit> CustomerCredits => Set<CustomerCredit>();

        public DbSet<CreditPayment> CreditPayments => Set<CreditPayment>();

        public DbSet<Store> Stores => Set<Store>();

        public DbSet<StoreSettings> StoresSettings => Set<StoreSettings>();


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.HasPostgresExtension("uuid-ossp");
            builder.ApplyConfigurationsFromAssembly(typeof(PosDbContext).Assembly);

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
