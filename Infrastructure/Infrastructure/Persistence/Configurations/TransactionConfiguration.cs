using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence.Configurations
{
    public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.PaymentType)
                   .HasMaxLength(20)
                   .IsRequired();

            
            builder.HasOne(t => t.User)
                   .WithMany()
                   .HasForeignKey(t => t.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.CustomerCredit)
                   .WithMany()
                   .HasForeignKey(t => t.CustomerCreditId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(t => t.TransactionDate);
        }
    }
}
