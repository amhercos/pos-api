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

        public ConnectionResolver(IConfiguration config, ICurrentUserService currentUser, IServiceProvider serviceProvider)
        {
            _config = config;
            _currentUser = currentUser;
            _serviceProvider = serviceProvider;
        }

        public string GetConnectionString()
        {
            var masterConnection = _config.GetConnectionString("PostgresConnection")
                ?? throw new InvalidOperationException("Master connection string not found.");

            if (_currentUser.StoreId == Guid.Empty)
                return masterConnection;

            using var scope = _serviceProvider.CreateScope();
            var masterContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();

            var store = masterContext.Stores
                .AsNoTracking()
                .FirstOrDefault(s => s.Id == _currentUser.StoreId && s.IsActive);

            if (store != null && store.MigrationStatus != MigrationStatus.Success)
            {
                throw new InvalidOperationException("Your store database is still being provisioned. Please wait a few seconds.");
            }

            return !string.IsNullOrEmpty(store?.ConnectionString)
                ? store.ConnectionString
                : masterConnection;
        }
    }
}