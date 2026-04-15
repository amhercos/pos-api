using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Entities
{
    public class Category : BaseEntity , ITenantEntity
    {
        public required string CategoryName { get; set; }
        public ICollection<Product> Products { get; set; } = new List<Product>();
        public Guid StoreId { get; set; }
        public Store Store { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
