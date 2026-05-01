using Domain.Entities.Common;
using Domain.Entities.Enums;

namespace Domain.Entities
{
    public class Promotion : BaseEntity, ITenantEntity
    {
        public required string Name { get; set; }
        public PromotionType Type { get; set; }

        public Guid StoreId { get; set; }
        public Store Store { get; set; } = null!;

        public Guid MainProductId { get; set; }
        public Product MainProduct { get; set; } = null!;
        // bulk
        public int? PromoQuantity { get; set; }
        public decimal? PromoPrice { get; set; }

      // tie up
        public Guid? TieUpProductId { get; set; }
        public Product? TieUpProduct { get; set; }
        public int? TieUpQuantity { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}