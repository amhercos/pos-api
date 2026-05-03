using Domain.Entities.Common;
using Domain.Entities.Enums;

namespace Domain.Entities
{
    public class Promotion : BaseEntity, ITenantEntity
    {
        public required string Name { get; set; }
        public PromotionType Type { get; set; } = PromotionType.Bulk;

        // Tenant Requirement
        public Guid StoreId { get; set; }
        public virtual Store Store { get; set; } = null!;

        public Guid MainProductId { get; set; }
        public virtual Product MainProduct { get; set; } = null!;

        // Bulk pricing
        public virtual ICollection<PromotionTier> Tiers { get; set; } = new List<PromotionTier>();

        // Bundle / Tie-up
        public Guid? TieUpProductId { get; set; }
        public virtual Product? TieUpProduct { get; set; }
        public int? TieUpQuantity { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}