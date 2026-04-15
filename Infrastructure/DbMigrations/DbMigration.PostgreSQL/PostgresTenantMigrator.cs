using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics; // Added for RelationalEventId
using Microsoft.Extensions.Logging;
using Npgsql;

namespace DbMigration.PostgreSQL
{
    public class PostgresTenantMigrator : ITenantMigrator
    {
        private readonly ILogger<PostgresTenantMigrator> _logger;

        public PostgresTenantMigrator(ILogger<PostgresTenantMigrator> logger)
        {
            _logger = logger;
        }

        public async Task MigrateTenantAsync(string connectionString, CancellationToken ct)
        {
            var optionsBuilder = new DbContextOptionsBuilder<PostgresPosDbContext>();

            optionsBuilder.UseNpgsql(connectionString, o =>
                o.MigrationsAssembly(typeof(PostgresPosDbContext).Assembly.FullName));

            
            optionsBuilder.ConfigureWarnings(w =>
                w.Ignore(RelationalEventId.PendingModelChangesWarning));

            using var context = new PostgresPosDbContext(optionsBuilder.Options, null!);

            try
            {
                await context.Database.MigrateAsync(ct);
            }
            catch (NpgsqlException ex) when (ex.SqlState == "42P07")
            {
                _logger.LogWarning("Migration already in progress or completed by another process.");
            }
        }
    }
}