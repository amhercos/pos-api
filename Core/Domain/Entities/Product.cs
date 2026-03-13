using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Product : BaseEntity
    {
        public required string Name { get; set; }
        public string Description { get; set; }
        public Guid CategoryId { get; set; }
        public Category Category { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int LowStockThreshold { get; set; }
        public DateOnly ExpiryDate { get; set; } 
    }
}
