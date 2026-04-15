using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Infrastructure.Services
{
    public class TenantConnectionStringBuilder : ITenantConnectionStringBuilder
    {
        private readonly IConfiguration _configuration;

        public TenantConnectionStringBuilder(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string Build(string businessName)
        {
            var safeName = businessName.Replace(" ", "_").ToLower();
            var uniqueId = Guid.NewGuid().ToString("N").Substring(0, 8);
            var dbName = $"bizflow_{safeName}_{uniqueId}";

            var masterConn = _configuration.GetConnectionString("PostgresConnection")
                             ?? throw new InvalidOperationException("Master connection string missing.");

            var builder = new NpgsqlConnectionStringBuilder(masterConn)
            {
                Database = dbName
            };

            return builder.ConnectionString;
        }
    }
}