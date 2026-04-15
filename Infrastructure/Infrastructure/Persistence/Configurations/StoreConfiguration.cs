using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class StoreConfiguration : IEntityTypeConfiguration<Store>
    {
        public void Configure(EntityTypeBuilder<Store> builder)
        {
            builder.HasKey(s => s.Id);
            builder.Property(s => s.StoreName).IsRequired().HasMaxLength(150);

            builder.Ignore(s => s.Categories);

            builder.HasOne(s => s.Settings)
                   .WithOne()
                   .HasForeignKey<StoreSettings>(ss => ss.StoreId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}