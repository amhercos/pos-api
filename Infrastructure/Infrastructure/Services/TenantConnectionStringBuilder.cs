using Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services
{
    public class TenantConnectionStringBuilder : ITenantConnectionStringBuilder
    {
        public TenantConnectionStringBuilder(IConfiguration configuration) { }

        public string Build(string businessName)
        {
            var safeName = businessName.Replace(" ", "_").ToLower();
            var uniqueId = Guid.NewGuid().ToString("N").Substring(0, 8);

            return $"tenant_{safeName}_{uniqueId}";
        }
    }
}