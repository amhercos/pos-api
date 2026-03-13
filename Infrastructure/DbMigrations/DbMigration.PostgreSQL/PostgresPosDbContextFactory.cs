using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace DbMigration.PostgreSQL
{
    /// <summary>
    /// Design-time factory for PostgresPosDbContext. 
    /// This allows the 'dotnet ef' tools to create an instance of the DbContext
    /// even if the API project is not running.
    /// </summary>
    public class PostgresPosDbContextFactory : IDesignTimeDbContextFactory<PostgresPosDbContext>
    {
        public PostgresPosDbContext CreateDbContext(string[] args)
        {
            // 1. Build configuration
            // We search for appsettings.json in the current directory.
            // When running 'dotnet ef', ensure you are in the project folder or point to it.
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddEnvironmentVariables()
                .Build();

            // 2. Retrieve connection string
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "The connection string 'DefaultConnection' was not found in 'appsettings.json'.");
            }

            // 3. Configure DbContextOptions
            var optionsBuilder = new DbContextOptionsBuilder<PostgresPosDbContext>();

            optionsBuilder.UseNpgsql(connectionString, sqlOptions =>
            {
                // Ensure migrations are recorded in the assembly where this factory lives
                sqlOptions.MigrationsAssembly(typeof(PostgresPosDbContextFactory).Assembly.FullName);

                // Matches your previous configuration for the history table
                sqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public");
            });

            // 4. Return the specific PostgreSQL context
            return new PostgresPosDbContext(optionsBuilder.Options);
        }
    }
}