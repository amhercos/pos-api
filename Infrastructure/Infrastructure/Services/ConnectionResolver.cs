using Application.Interfaces;
using Domain.Entities.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Services
{
    public class ConnectionResolver : IConnectionResolver
    {
        private readonly IConfiguration _config;
        private readonly ICurrentUserService _currentUser;
        private readonly IServiceProvider _serviceProvider;

        public ConnectionResolver(
            IConfiguration config,
            ICurrentUserService currentUser,
            IServiceProvider serviceProvider)
        {
            _config = config;
            _currentUser = currentUser;
            _serviceProvider = serviceProvider;
        }

        public string GetConnectionString()
        {

            var connectionString = _config.GetConnectionString("PostgresConnection");

            if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("PLACEHOLDER"))
            {
                throw new InvalidOperationException(
                    "Database Connection String is missing or set to PLACEHOLDER. " +
                    "Check your appsettings.Development.json or Environment Variables.");
            }

            if (_currentUser.StoreId != Guid.Empty)
            {
                // Use a temporary scope to check the Store status in the Master DB
                using var scope = _serviceProvider.CreateScope();
                var masterContext = scope.ServiceProvider.GetRequiredService<AppIdentityDbContext>();

                var store = masterContext.Stores
                    .AsNoTracking()
                    .FirstOrDefault(s => s.Id == _currentUser.StoreId);

                if (store == null || !store.IsActive)
                {
                    throw new UnauthorizedAccessException("This store is inactive or does not exist.");
                }

                if (store.MigrationStatus != MigrationStatus.Success)
                {
         
                    throw new InvalidOperationException("Your store environment is being prepared. Please try again in a few seconds.");
                }
            }

            return connectionString;
        }
    }
}