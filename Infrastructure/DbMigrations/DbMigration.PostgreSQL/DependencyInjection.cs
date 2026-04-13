using Application.Interfaces;
using Infrastructure.Persistence;
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

            string conString = configuration.GetConnectionString("PostgresConnection")
                ?? throw new InvalidOperationException("Connection string 'PostgresConnection' not found.");

            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

     
            services.AddDbContext<PostgresPosDbContext>(options =>
            {
                options.UseNpgsql(
                    conString,
                    npgsqlOptionsAction: opt =>
                    {
                        opt.MigrationsAssembly(assemblyName);
                        opt.MigrationsHistoryTable("__EFMigrationsHistory", "public");
                    }
                );
                options.ConfigureWarnings(w => 
                w.Ignore(RelationalEventId.PendingModelChangesWarning));
            });

            


            services.AddScoped<PosDbContext>(provider =>
                provider.GetRequiredService<PostgresPosDbContext>());

            services.AddScoped<IPosDbContext>(provider =>
                provider.GetRequiredService<PostgresPosDbContext>());

            services.AddScoped<DbContext>(provider =>
                provider.GetRequiredService<PostgresPosDbContext>());

            return services;
        }
    }
}