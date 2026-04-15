using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Enums
{
    public enum MigrationStatus
    {
        Pending = 0,
        Processing = 1,
        Success = 2,
        Failed = 3
    }
}
