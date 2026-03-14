using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Store : BaseEntity
    {
        public required string StoreName { get; set; }
        public string Location { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual StoreSettings Settings { get; set; } = null!;
    }
}
