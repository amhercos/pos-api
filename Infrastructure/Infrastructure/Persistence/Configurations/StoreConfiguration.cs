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
            builder.Property(s => s.StoreName)
                .IsRequired()
                .HasMaxLength(150);
            

            // One-to-One Relationship , Store => StoreSettings
            builder.HasOne(s => s.Settings)
                   .WithOne()
                   .HasForeignKey<StoreSettings>(ss => ss.StoreId)
                   .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(s => s.Categories)
                .WithOne(c => c.Store)
                .HasForeignKey(c => c.StoreId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
