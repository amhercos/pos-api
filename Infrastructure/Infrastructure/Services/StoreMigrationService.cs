using Application.Interfaces;
using Domain.Entities.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    public class StoreMigrationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<StoreMigrationService> _logger;
        private const int IntervalSeconds = 30;

        public StoreMigrationService(
            IServiceProvider serviceProvider,
            ILogger<StoreMigrationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Store Migration Watchdog started in Auto-Sync mode.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var masterContext = scope.ServiceProvider.GetRequiredService<AppIdentityDbContext>();
                    var migrator = scope.ServiceProvider.GetRequiredService<ITenantMigrator>();

                    var stores = await masterContext.Stores
                        .Where(s => s.IsActive)
                        .ToListAsync(stoppingToken);

                    foreach (var store in stores)
                    {
                        try { 
                       
                            await migrator.MigrateTenantAsync(store.ConnectionString!, stoppingToken);


                            if (store.MigrationStatus != MigrationStatus.Success)
                            {
                                store.MigrationStatus = MigrationStatus.Success;
                                store.MigrationNotes = $"Updated to latest version at {DateTime.UtcNow} UTC";
                                await masterContext.SaveChangesAsync(stoppingToken);
                            }
                        }
                        catch (Exception ex)
                        {
                            store.MigrationStatus = MigrationStatus.Failed;
                            store.MigrationNotes = $"Auto-Sync Failed: {ex.Message}";
                            await masterContext.SaveChangesAsync(stoppingToken);
                            _logger.LogError(ex, "Sync failed for {StoreName}", store.StoreName);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Critical error in migration loop.");
                }

                await Task.Delay(TimeSpan.FromSeconds(IntervalSeconds), stoppingToken);
            }
        }
    }
}