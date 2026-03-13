using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class TransactionItemConfiguration : IEntityTypeConfiguration<TransactionItem>
    {
        public void Configure(EntityTypeBuilder<TransactionItem> builder)
        {
            builder.HasKey(ti => ti.Id);

            // Link items to the main Transaction
            builder.HasOne<Transaction>()
                   .WithMany(t => t.Items)
                   .HasForeignKey(ti => ti.TransactionId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Link item to the Product
            builder.HasOne(ti => ti.Product)
                   .WithMany()
                   .HasForeignKey(ti => ti.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}