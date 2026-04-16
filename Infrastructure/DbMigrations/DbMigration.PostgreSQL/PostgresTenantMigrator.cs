using Application.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace DbMigration.PostgreSQL
{
    public class PostgresTenantMigrator : ITenantMigrator
    {
        private readonly ILogger<PostgresTenantMigrator> _logger;
        private readonly IServiceProvider _serviceProvider;

        public PostgresTenantMigrator(
            ILogger<PostgresTenantMigrator> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public async Task MigrateTenantAsync(string schemaName, CancellationToken ct)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
                var connectionString = configuration.GetConnectionString("PostgresConnection");

                var tenantConnectionString = new NpgsqlConnectionStringBuilder(connectionString)
                {
                    SearchPath = schemaName
                }.ToString();

                using (var connection = new NpgsqlConnection(tenantConnectionString))
                {
                    await connection.OpenAsync(ct);
                    using var cmd = connection.CreateCommand();
                    cmd.CommandText = $@"CREATE SCHEMA IF NOT EXISTS ""{schemaName}"";";
                    await cmd.ExecuteNonQueryAsync(ct);
                }

                var optionsBuilder = new DbContextOptionsBuilder<PostgresPosDbContext>();
                optionsBuilder.UseNpgsql(tenantConnectionString, x =>
                {
                    x.MigrationsAssembly("DbMigration.PostgreSQL");
                    x.MigrationsHistoryTable("__EFMigrationsHistory", schemaName);
                })
                .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

                var migrationContext = new MigrationUserContext(schemaName);
                using var context = new PostgresPosDbContext(optionsBuilder.Options, migrationContext);

                var pendingMigrations = await context.Database.GetPendingMigrationsAsync(ct);
                var migrationsList = pendingMigrations.ToList();

                if (migrationsList.Any())
                {
                    _logger.LogInformation("Schema {Schema} is out of date. Applying {Count} migrations: {List}",
                        schemaName, migrationsList.Count, string.Join(", ", migrationsList));

                    await context.Database.MigrateAsync(ct);

                    _logger.LogInformation("Successfully updated {Schema} to latest version.", schemaName);
                }
                else
                {
                    _logger.LogDebug("Schema {Schema} is already up to date.", schemaName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Migration failed for {Schema}", schemaName);
                throw;
            }
        }

        private class MigrationUserContext(string schema) : ICurrentUserService
        {
            public Guid? UserId => null;
            public Guid StoreId => Guid.Empty;
            public string? Role => null;
            public string? SchemaName => schema;
        }
    }
}