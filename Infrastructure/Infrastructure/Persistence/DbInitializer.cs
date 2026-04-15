using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAdminUser(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppIdentityDbContext>>();

        try
        {
            if (!await roleManager.RoleExistsAsync("SuperAdmin"))
            {
                logger.LogInformation("Creating 'SuperAdmin' role...");
                var roleResult = await roleManager.CreateAsync(new IdentityRole<Guid>
                {
                    Name = "SuperAdmin",
                    NormalizedName = "SUPERADMIN"
                });

                if (!roleResult.Succeeded)
                {
                    logger.LogError("Failed to create role: {Errors}", string.Join(", ", roleResult.Errors.Select(e => e.Description)));
                    return;
                }
            }

            var adminEmail = "admin@bizflow.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                logger.LogInformation("Admin user ({Email}) not found. Starting seeding process...", adminEmail);

                var admin = new User
                {
                    UserName = "admin",
                    Email = adminEmail,
                    FullName = "System Admin",
                    StoreId = null,
                    Store = null!,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow
                };

       
                logger.LogInformation("Creating admin user");
                var result = await userManager.CreateAsync(admin, "Admin123!");

                if (result.Succeeded)
                {
                    logger.LogInformation("account created. Assigning role");
                    var roleAssignResult = await userManager.AddToRoleAsync(admin, "SuperAdmin");

                    if (roleAssignResult.Succeeded)
                    {
                        logger.LogInformation("SuperAdmin seeded successfully.");
                    }
                    else
                    {
                        logger.LogError("User created but role assignment failed: {Errors}",
                            string.Join(", ", roleAssignResult.Errors.Select(e => e.Description)));
                    }
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    logger.LogError(" Admin seeding failed! Reasons: {Errors}", errors);
                }
            }
            else
            {
                logger.LogInformation("Admin already exists");
            }
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "FATAL ERROR during seeding: {Message}", ex.Message);
        }
    }
}