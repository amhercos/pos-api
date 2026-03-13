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

            builder.HasMany(cc => cc.Payments)
                   .WithOne(cp => cp.CustomerCredit)
                   .HasForeignKey(cp => cp.CustomerCreditId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(cc => cc.CustomerName);
        }
    }
}
