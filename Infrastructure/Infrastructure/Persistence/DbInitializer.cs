using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAdminUser(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
        var logger = serviceProvider.GetRequiredService<ILogger<User>>();

        var existingUser = await userManager.FindByNameAsync("admin");

        if (existingUser == null)
        {
            var admin = new User
            {
                UserName = "admin",
                Email = "admin@bizflow.com",
                FullName = "System Admin",
                Role = "SuperAdmin",
                StoreId = null,
                CreatedAt = DateTime.UtcNow,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, "Admin123!");

            if (result.Succeeded)
            {
                logger.LogInformation("Admin user seeded successfully.");
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogError("Failed to seed admin user: {Errors}", errors);
                throw new Exception($"Failed to seed admin user: {errors}");
            }
        }
    }
}