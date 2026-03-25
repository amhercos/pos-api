using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAdminUser(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

        // Check if admin already exists
        if (await userManager.FindByNameAsync("admin") == null)
        {
          
                var admin = new User
            {
                UserName = "admin",
                Email = "admin@admin",
                FullName = "System Admin",
                Role = "SuperAdmin", 
                StoreId = null,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(admin, "adminpassword");

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to seed admin user: {errors}");
            }
        }
    }
}