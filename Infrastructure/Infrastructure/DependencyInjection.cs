using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
//using Infrastructure.Persistence.Interceptors; Ensure this namespace matches your interceptor location
using Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {

            // 2. Configure DbContext with PostgreSQL and Interceptors
            // Note: We register PosDbContext but point the implementation to PostgresPosDbContext
            services.AddDbContext<PosDbContext>((sp, options) =>
            {
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(PosDbContext).Assembly.FullName));
                       
            });

            // 3. Configure Identity (Matching your preferred SCS settings)
            services.AddIdentity<User, IdentityRole<Guid>>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = false;
            })
            .AddEntityFrameworkStores<PosDbContext>()
            .AddDefaultTokenProviders();

            // 4. Register Services & Interfaces
            services.AddTransient<IJwtService, JwtService>();

            // Register against the interface for Clean Architecture Handlers
            services.AddScoped<IPosDbContext>(provider =>
                provider.GetRequiredService<PosDbContext>());

            // Add your Repositories here as you build them, just like in SCS
            // services.AddScoped<IProductRepository, ProductRepository>();

            return services;
        }
    }
}