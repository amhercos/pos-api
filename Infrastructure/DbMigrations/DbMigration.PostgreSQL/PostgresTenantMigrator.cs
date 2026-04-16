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

                // 1. Ensure Schema Exists
                using (var connection = new NpgsqlConnection(tenantConnectionString))
                {
                    await connection.OpenAsync(ct);
                    using var cmd = connection.CreateCommand();
                    cmd.CommandText = $@"CREATE SCHEMA IF NOT EXISTS ""{schemaName}"";";
                    await cmd.ExecuteNonQueryAsync(ct);

                    // 2. RECONCILIATION CHECK: 
                    // Check if 'Categories' exists but '__EFMigrationsHistory' does not.
                    bool tablesExist = await TableExistsAsync(connection, schemaName, "Categories", ct);
                    bool historyExists = await TableExistsAsync(connection, schemaName, "__EFMigrationsHistory", ct);

                    if (tablesExist && !historyExists)
                    {
                        _logger.LogWarning("Schema {Schema} has existing tables but no EF history. Patching history table...", schemaName);
                        await SeedMigrationHistoryAsync(connection, schemaName, "20260416100426_Initial_Tenant_Schema", ct);
                    }
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
                if (pendingMigrations.Any())
                {
                    await context.Database.MigrateAsync(ct);
                    _logger.LogInformation("Successfully updated {Schema} to latest version.", schemaName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Migration failed for {Schema}", schemaName);
                throw;
            }
        }

        // Helper: Check for existing tables to prevent "Relation already exists"
        private async Task<bool> TableExistsAsync(NpgsqlConnection conn, string schema, string table, CancellationToken ct)
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = @schema AND table_name = @table)";
            cmd.Parameters.AddWithValue("schema", schema);
            cmd.Parameters.AddWithValue("table", table);
            return (bool)(await cmd.ExecuteScalarAsync(ct) ?? false);
        }

        // Helper: Seed the history table manually
        private async Task SeedMigrationHistoryAsync(NpgsqlConnection conn, string schema, string migrationId, CancellationToken ct)
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = $@"
        CREATE TABLE IF NOT EXISTS ""{schema}"".""__EFMigrationsHistory"" (
            ""MigrationId"" character varying(150) NOT NULL,
            ""ProductVersion"" character varying(32) NOT NULL,
            CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
        );
        INSERT INTO ""{schema}"".""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
        VALUES ('{migrationId}', '9.0.0');"; // Use your actual EF version
            await cmd.ExecuteNonQueryAsync(ct);
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