using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class AppIdentityDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>, IAppIdentityDbContext
    {
        public AppIdentityDbContext(DbContextOptions<AppIdentityDbContext> options) : base(options) { }

        public DbSet<Store> Stores => Set<Store>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            //builder.HasDefaultSchema("public");
            base.OnModelCreating(builder);

            builder.Entity<Store>(entity => {
                entity.HasIndex(s => s.StoreName)
                      .HasDatabaseName("IX_Stores_StoreName_Unique")
                      .IsUnique();
            });
            builder.Ignore<Category>();
            builder.Ignore<Product>();
            builder.Ignore<Transaction>();
            builder.Ignore<TransactionItem>();
            builder.Ignore<CustomerCredit>();
            builder.Ignore<CreditPayment>();
            builder.Ignore<StoreSettings>();
           
        }
    }
}