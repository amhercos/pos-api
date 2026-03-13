using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence.Configurations
{
    public class CustomerCreditConfiguration : IEntityTypeConfiguration<CustomerCredit>
    {
            public void Configure(EntityTypeBuilder<CustomerCredit> builder)
        { 
        
            builder.HasKey(cc => cc.Id);
            builder.Property(cc => cc.CustomerName).IsRequired().HasMaxLength(200);

            // One Customer => many Payment records
            builder.HasMany(cc => cc.Payments)
                   .WithOne()
                   .HasForeignKey(p => p.CustomerCreditId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(cc => cc.CustomerName);
        }
    }
}
