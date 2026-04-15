using Application.Features.Auth.Commands;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Entities.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public class RegisterStoreOwnerHandler
    (
        UserManager<User> userManager,
        IStoreRepository storeRepository,
        IPosDbContext context,
        ITenantConnectionStringBuilder connectionStringBuilder,
        IServiceProvider serviceProvider, 
        ILogger<RegisterStoreOwnerHandler> logger 
    ) : IRequestHandler<RegisterStoreOwnerCommand, bool>
{
    public async Task<bool> Handle(RegisterStoreOwnerCommand request, CancellationToken ct)
    {

        await context.BeginTransactionAsync(ct);

        try
        {
            var tenantConnectionString = connectionStringBuilder.Build(request.BusinessName);

            var store = new Store
            {
                Id = Guid.NewGuid(),
                Location = request.Location,
                StoreName = request.BusinessName,
                ConnectionString = tenantConnectionString,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                MigrationStatus = MigrationStatus.Pending
            };

            await storeRepository.AddAsync(store, ct);
            await context.SaveChangesAsync(ct);

            var user = new User
            {
                Email = request.Email,
                UserName = request.Email,
                FullName = request.FullName,
                StoreId = store.Id,
                Role = "StoreOwner",
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                await context.RollbackTransactionAsync(ct);
                return false;
            }

            await context.CommitTransactionAsync(ct);

            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = serviceProvider.CreateScope();
                    var migrator = scope.ServiceProvider.GetRequiredService<ITenantMigrator>();

                    await migrator.MigrateTenantAsync(tenantConnectionString, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Instant migration trigger failed for {StoreName}", request.BusinessName);
                }
            }, ct);

            return true;
        }
        catch (Exception ex)
        {
            await context.RollbackTransactionAsync(ct);
            logger.LogError(ex, "Critical error during registration for {StoreName}", request.BusinessName);
            throw;
        }
    }
}