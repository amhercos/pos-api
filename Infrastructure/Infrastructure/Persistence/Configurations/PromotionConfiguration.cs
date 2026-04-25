using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class PromotionConfiguration : IEntityTypeConfiguration<Promotion>
    {
        public void Configure(EntityTypeBuilder<Promotion> builder)
        {
            builder.ToTable("Promotions");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(p => p.Type)
                .IsRequired();

            builder.Property(p => p.PromoPrice)
                .HasPrecision(18, 2);

            builder.Property(p => p.StoreId)
                .IsRequired();


            // -> Main Product (required)
            builder.HasOne(p => p.MainProduct)
             .WithMany(p => p.Promotions)
             .HasForeignKey(p => p.MainProductId)
             .OnDelete(DeleteBehavior.Restrict);

            // -> Tie-up Product (optional)
            builder.HasOne(p => p.TieUpProduct)
                .WithMany()
                .HasForeignKey(p => p.TieUpProductId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(p => p.Store)
                .WithMany()
                .HasForeignKey(p => p.StoreId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(p => p.RowVersion)
                .IsRowVersion();

            builder.HasIndex(p => p.StoreId);
            builder.HasIndex(p => p.MainProductId);
            builder.HasIndex(p => p.IsActive);
        }
    }
}