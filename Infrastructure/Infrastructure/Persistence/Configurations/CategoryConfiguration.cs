using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(c => c.CategoryName)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Ignore(c => c.Store);

            builder.HasIndex(c => new { c.CategoryName, c.StoreId }).IsUnique();
        }
    }
}