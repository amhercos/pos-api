using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class StoreSettings : BaseEntity
    {
        public Guid StoreId { get; set; }
        public string ContactInfo { get; set; }
        public string? Email { get; set; }

        // Alert Configs
        public int LowStockAlertThreshold { get; set; } = 5; 
        public int NearExpiryAlertDays { get; set; } = 30;
    }
}
