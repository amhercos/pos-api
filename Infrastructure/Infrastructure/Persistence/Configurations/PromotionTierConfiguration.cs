using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class PromotionTierConfiguration : IEntityTypeConfiguration<PromotionTier>
    {
        public void Configure(EntityTypeBuilder<PromotionTier> builder)
        {
            builder.ToTable("PromotionTiers");

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Quantity)
                .IsRequired();

            builder.Property(t => t.Price)
                .HasPrecision(18, 2)
                .IsRequired();

            builder.HasIndex(t => t.PromotionId);
        }
    }
}