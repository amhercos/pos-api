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

            builder.HasOne(ti => ti.Transaction)
                   .WithMany(t => t.Items)
                   .HasForeignKey(ti => ti.TransactionId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ti => ti.Product)
                   .WithMany()
                   .HasForeignKey(ti => ti.ProductId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}