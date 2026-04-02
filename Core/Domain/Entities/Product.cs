using Domain.Entities.Common;
using System.ComponentModel.DataAnnotations;


namespace Domain.Entities
{
    public class Product : BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public Guid? CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public Guid StoreId { get; set; }
        public Store Store { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int LowStockThreshold { get; set; }
        public DateOnly? ExpiryDate { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
    }
}
