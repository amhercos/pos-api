using Application.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DbMigration.SQLite
{
    public static class DependencyInjection
    {
        public static IServiceCollection UseSQLite(this InfrastructureOption option, IConfiguration? tempConfiguration = null)
        {
            var services = option.Services;
            var configuration = tempConfiguration ?? option.Configuration;
            var assemblyName = typeof(SqlitePosDbContext).Assembly.FullName;

            string conString = configuration.GetConnectionString("SQLiteConnection") ?? "Data Source=bizflow.db";

            services.AddDbContext<SqlitePosDbContext>(options =>
            {
                options.UseSqlite(conString, opt => opt.MigrationsAssembly(assemblyName));
            });

            services.AddScoped<PosDbContext>(p => p.GetRequiredService<SqlitePosDbContext>());
            services.AddScoped<IPosDbContext>(p => p.GetRequiredService<SqlitePosDbContext>());
            services.AddScoped<DbContext>(p => p.GetRequiredService<SqlitePosDbContext>());

            return services;
        }
    }
}