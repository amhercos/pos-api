    using Application.Interfaces;
    using Infrastructure.Persistence;
    using Infrastructure.Services;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Diagnostics;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

namespace DbMigration.PostgreSQL
{
    public static class DependencyInjection
    {
        public static IServiceCollection UsePostgreSQL(this InfrastructureOption option, IConfiguration? tempConfiguration = null)
        {
            var services = option.Services;
            var configuration = tempConfiguration ?? option.Configuration;
            var assemblyName = typeof(PostgresPosDbContext).Assembly.FullName;
            var masterConnection = configuration.GetConnectionString("PostgresConnection");

 
            services.AddDbContext<MasterDbContext>(options =>
                options.UseNpgsql(masterConnection, o => o.MigrationsAssembly(assemblyName)));

            services.AddScoped<IConnectionResolver, ConnectionResolver>();

           // dynamic connection
            services.AddDbContext<PostgresPosDbContext>((serviceProvider, options) =>
            {
                var resolver = serviceProvider.GetRequiredService<IConnectionResolver>();

                options.UseNpgsql(resolver.GetConnectionString(), opt =>
                {
                    opt.MigrationsAssembly(assemblyName);
                    opt.MigrationsHistoryTable("__EFMigrationsHistory", "public");
                });

                options.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
            });

            // Abstractions
            services.AddScoped<PosDbContext>(p => p.GetRequiredService<PostgresPosDbContext>());
            services.AddScoped<IPosDbContext>(p => p.GetRequiredService<PostgresPosDbContext>());
            services.AddScoped<ITenantMigrator, PostgresTenantMigrator>();

            return services;
        }
    }
}