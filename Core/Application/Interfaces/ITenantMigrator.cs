using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface ITenantMigrator
    {
        Task MigrateTenantAsync(string connectionString, CancellationToken ct);
    }
}
