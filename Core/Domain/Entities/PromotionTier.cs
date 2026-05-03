using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class PromotionTier : BaseEntity , ITenantEntity
    {
        public Guid StoreId { get; set; }
        public Guid PromotionId { get; set; }
        public Promotion Promotion { get; set; } = null!;

        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
