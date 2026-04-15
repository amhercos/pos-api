using Application.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace DbMigration.SQLite
{
    public class SqlitePosDbContextFactory : IDesignTimeDbContextFactory<SqlitePosDbContext>
    {
        public SqlitePosDbContext CreateDbContext(string[] args)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true)
                .Build();

            var connectionString = configuration.GetConnectionString("SQLiteConnection") ?? "Data Source=bizflow.db";

            var optionsBuilder = new DbContextOptionsBuilder<PosDbContext>();
            optionsBuilder.UseSqlite(connectionString, sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(typeof(SqlitePosDbContextFactory).Assembly.FullName);
            });

            return new SqlitePosDbContext(optionsBuilder.Options, new DesignTimeCurrentUserService());
        }

        private class DesignTimeCurrentUserService : ICurrentUserService
        {
            public Guid? UserId => Guid.Empty;
            public Guid StoreId => Guid.Empty;
            public string? Role => "Admin";
            public string? SchemaName => "public";
        }
    }
}