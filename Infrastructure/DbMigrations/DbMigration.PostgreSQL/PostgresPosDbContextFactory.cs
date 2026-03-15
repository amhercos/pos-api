using Application.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;


namespace DbMigration.PostgreSQL
{
    public class PostgresPosDbContextFactory : IDesignTimeDbContextFactory<PostgresPosDbContext>
    {
        public PostgresPosDbContext CreateDbContext(string[] args)
        {

            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddEnvironmentVariables()
                .Build();


            var connectionString = configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "The connection string 'DefaultConnection' was not found in 'appsettings.json'.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<PosDbContext>();

            optionsBuilder.UseNpgsql(connectionString, sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(typeof(PostgresPosDbContextFactory).Assembly.FullName);
                sqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "public");
            });


            var dummyUserService = new DesignTimeCurrentUserService();

            return new PostgresPosDbContext(optionsBuilder.Options, dummyUserService);
        }

        private class DesignTimeCurrentUserService : ICurrentUserService
        {
            public Guid? UserId => Guid.Empty;
            public Guid StoreId => Guid.Empty;
            public string? Role => "Admin"; 
        }
    }
}