using Application.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Infrastructure.Persistence
{
    public static class DependencyInjection
    {
        /// <summary>
        /// Registers the PosDbContext with PostgreSQL configuration.
        /// </summary>
        public static IServiceCollection UsePostgreSQL(this InfrastructureOption option, IConfiguration? tempConfiguration = null)
        {
            var services = option.Services;
            var configuration = tempConfiguration ?? option.Configuration;

            string conString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

            services.AddDbContext<PosDbContext>(options =>
            {
                options.UseNpgsql(
                    conString,
                    npgsqlOptionsAction: opt =>
                    {
                        opt.MigrationsAssembly(Assembly.GetExecutingAssembly().FullName);
                        opt.MigrationsHistoryTable("__EFMigrationsHistory", "public");
                    }
                );
            });

            // Register against the interface for Clean Architecture Handlers
            services.AddScoped<IPosDbContext>(provider =>
                provider.GetRequiredService<PosDbContext>());

            services.AddScoped<DbContext>(provider =>
                provider.GetRequiredService<PosDbContext>());

            return services;
        }
    }
}