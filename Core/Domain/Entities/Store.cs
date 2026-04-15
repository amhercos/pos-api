using Domain.Entities.Common;
using Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Store : BaseEntity
    {
        public required string StoreName { get; set; }
        public string? ConnectionString { get; set; }
        public string Location { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual StoreSettings Settings { get; set; } = null!;
        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public bool IsActive { get; set; } = true;

        public MigrationStatus MigrationStatus { get; set; } = MigrationStatus.Pending;
        public string? MigrationNotes { get; set; }
    }
}
