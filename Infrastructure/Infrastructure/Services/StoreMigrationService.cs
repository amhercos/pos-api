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
            _logger.LogInformation("Store Migration Watchdog started in State-Driven mode using MasterDbContext.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();

                    var masterContext = scope.ServiceProvider.GetRequiredService<AppIdentityDbContext>();
                    var migrator = scope.ServiceProvider.GetRequiredService<ITenantMigrator>();

                    var pendingStores = await masterContext.Stores
                        .Where(s => s.IsActive &&
                                   (s.MigrationStatus == MigrationStatus.Pending ||
                                    s.MigrationStatus == MigrationStatus.Failed))
                        .ToListAsync(stoppingToken);

                    if (pendingStores.Any())
                    {
                        _logger.LogInformation("Found {Count} stores requiring migration.", pendingStores.Count);

                        foreach (var store in pendingStores)
                        {
                            try
                            {
                                _logger.LogInformation("Processing migration for store: {StoreName}", store.StoreName);

                                store.MigrationStatus = MigrationStatus.Processing;
                                await masterContext.SaveChangesAsync(stoppingToken);

                                await migrator.MigrateTenantAsync(store.ConnectionString!, stoppingToken);

                                store.MigrationStatus = MigrationStatus.Success;
                                store.MigrationNotes = $"Migrated successfully at {DateTime.UtcNow} UTC";
                            }
                            catch (Exception ex)
                            {
                                store.MigrationStatus = MigrationStatus.Failed;
                                store.MigrationNotes = ex.Message;
                                _logger.LogError(ex, "Migration failed for store {StoreId} ({StoreName})", store.Id, store.StoreName);
                            }

                            await masterContext.SaveChangesAsync(stoppingToken);
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