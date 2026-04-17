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
                    SearchPath = schemaName,
                    Pooling = false
                }.ToString();

                using (var connection = new NpgsqlConnection(tenantConnectionString))
                {
                    await connection.OpenAsync(ct);
                    using var cmd = connection.CreateCommand();
                    cmd.CommandText = $@"CREATE SCHEMA IF NOT EXISTS ""{schemaName}""; 
                                SET search_path TO ""{schemaName}"";";
                    await cmd.ExecuteNonQueryAsync(ct);
                }

                var optionsBuilder = new DbContextOptionsBuilder<PostgresPosDbContext>();
                optionsBuilder.UseNpgsql(tenantConnectionString, x =>
                {
                    x.MigrationsAssembly(typeof(PostgresPosDbContext).Assembly.GetName().Name);
                    x.MigrationsHistoryTable("__EFMigrationsHistory", schemaName);
                })
                .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

                var migrationContext = new MigrationUserContext(schemaName);
                using var context = new PostgresPosDbContext(optionsBuilder.Options, migrationContext);

                var pendingMigrations = await context.Database.GetPendingMigrationsAsync(ct);
                if (pendingMigrations.Any())
                {
                    _logger.LogInformation("Applying migrations to schema {Schema}...", schemaName);
                    await context.Database.MigrateAsync(ct);
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