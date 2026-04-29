using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
    {
        public void Configure(EntityTypeBuilder<StoreSettings> builder)
        {
            builder.HasKey(ss => ss.Id);

            builder.HasIndex(ss => ss.StoreId);

            builder.Property(ss => ss.LowStockAlertThreshold)
                   .HasDefaultValue(5)
                   .IsRequired();

            builder.Property(ss => ss.NearExpiryAlertDays)
                   .HasDefaultValue(30)
                   .IsRequired();

            builder.Property(ss => ss.UpdatedAt)
                   .IsRequired();

        }
    }
}