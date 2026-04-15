using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class CreditPaymentConfiguration : IEntityTypeConfiguration<CreditPayment>
    {
        public void Configure(EntityTypeBuilder<CreditPayment> builder)
        {
            builder.HasKey(cp => cp.Id);

            builder.HasOne(cp => cp.CustomerCredit)
                   .WithMany()
                   .HasForeignKey(cp => cp.CustomerCreditId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Property(cp => cp.PaymentDate)
                   .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
