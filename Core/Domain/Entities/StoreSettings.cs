using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class StoreSettings : BaseEntity, ITenantEntity
    {
        public Guid StoreId { get; set; }

        // Alert Configs
        public int LowStockAlertThreshold { get; set; } = 5;
        public int NearExpiryAlertDays { get; set; } = 30;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
