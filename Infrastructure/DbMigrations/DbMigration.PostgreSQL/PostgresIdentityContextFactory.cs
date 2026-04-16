using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace DbMigration.PostgreSQL;

public class PostgresIdentityContextFactory : IDesignTimeDbContextFactory<AppIdentityDbContext>
{
    public AppIdentityDbContext CreateDbContext(string[] args)
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("PostgresConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'PostgresConnection' not found.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<AppIdentityDbContext>();

        optionsBuilder.UseNpgsql(connectionString, sqlOptions =>
        {
           
            sqlOptions.MigrationsAssembly(typeof(PostgresIdentityContextFactory).Assembly.FullName);
          
            sqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public");
        });

        return new AppIdentityDbContext(optionsBuilder.Options);
    }
}