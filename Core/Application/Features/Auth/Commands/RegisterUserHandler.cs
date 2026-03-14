using Application.Features.Auth.Commands;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

public class RegisterStoreOwnerHandler 
    (
        UserManager<User> userManager,
        IStoreRepository storeRepository,
        IPosDbContext context
    ) : IRequestHandler<RegisterStoreOwnerCommand, bool>
{

    public async Task<bool> Handle(RegisterStoreOwnerCommand request, CancellationToken ct)
    {
        await context.BeginTransactionAsync(ct);

        try
        {
            var store = new Store
            {
                Id = Guid.NewGuid(),
                Location = request.Location,
                StoreName = request.BusinessName,
                CreatedAt = DateTime.UtcNow
            };

            await storeRepository.AddAsync(store, ct);
            await context.SaveChangesAsync(ct);


            var user = new User
            {
                Email = request.Email,
                UserName = request.Email,
                FullName = request.FullName,
                StoreId = store.Id,
                Role = "StoreOwner",
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                await context.RollbackTransactionAsync(ct);
                return false;
            }

            await context.CommitTransactionAsync(ct);
            return true;
        }
        catch (Exception)
        {
            await context.RollbackTransactionAsync(ct);
            throw;
        }
    }
}
