using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // 1. Configure DbContext with PostgreSQL
            services.AddDbContext<PosDbContext>(options =>
                options.UseNpgsql(connectionString,
                    b => b.MigrationsAssembly(typeof(PosDbContext).Assembly.FullName)));

            // 2. Register the Interface for use in Application Layer
            services.AddScoped<IPosDbContext>(provider => provider.GetRequiredService<PosDbContext>());

            // 3. Configure ASP.NET Identity
            services.AddIdentityCore<User>(options => {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = false;
                options.User.RequireUniqueEmail = false;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<PosDbContext>()
            .AddDefaultTokenProviders();

            return services;
        }
    }
}