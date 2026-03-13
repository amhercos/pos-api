using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence.Configurations
{
    public class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>

    {
        public void Configure(EntityTypeBuilder<StoreSettings> builder)
        {
            builder.HasKey(ss => ss.Id);

            builder.Property(ss => ss.LowStockAlertThreshold).HasDefaultValue(5);
            builder.Property(ss => ss.NearExpiryAlertDays).HasDefaultValue(30);
        }
    }
}
