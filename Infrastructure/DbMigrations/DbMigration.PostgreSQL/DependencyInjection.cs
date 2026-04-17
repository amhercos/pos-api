using Application.Interfaces;
using Infrastructure.Persistence;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DbMigration.PostgreSQL;

public static class DependencyInjection
{
    public static IServiceCollection UsePostgreSQL(this InfrastructureOption option, IConfiguration? tempConfiguration = null)
    {
        var services = option.Services;
        var configuration = tempConfiguration ?? option.Configuration;
        var assemblyName = typeof(PostgresPosDbContext).Assembly.GetName().Name;
        var masterConnection = configuration.GetConnectionString("PostgresConnection");

        services.AddDbContext<AppIdentityDbContext>(options =>
        options.UseNpgsql(masterConnection, o =>
        {
            o.MigrationsAssembly(assemblyName);
            o.MigrationsHistoryTable("__EFMigrationsHistory", "public");
            
            options.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
        }));

       

        services.AddScoped<IConnectionResolver, ConnectionResolver>();

        services.AddDbContext<PostgresPosDbContext>((serviceProvider, options) =>
        {
            var resolver = serviceProvider.GetRequiredService<IConnectionResolver>();
            var currentUserService = serviceProvider.GetRequiredService<ICurrentUserService>();

            var schemaName = currentUserService.SchemaName;

            options.UseNpgsql(resolver.GetConnectionString(), opt =>
            {
                opt.MigrationsAssembly(assemblyName);
                opt.MigrationsHistoryTable("__EFMigrationsHistory", schemaName ?? "public");
            })
            .ReplaceService<Microsoft.EntityFrameworkCore.Infrastructure.IModelCacheKeyFactory, TenantModelCacheKeyFactory>();

            options.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
        });


        services.AddSingleton<Microsoft.EntityFrameworkCore.Infrastructure.IModelCacheKeyFactory, TenantModelCacheKeyFactory>();

        // Abstractions
        services.AddScoped<PosDbContext>(p => p.GetRequiredService<PostgresPosDbContext>());
        services.AddScoped<IPosDbContext>(p => p.GetRequiredService<PostgresPosDbContext>());
        services.AddScoped<ITenantMigrator, PostgresTenantMigrator>();

        return services;
    }
}