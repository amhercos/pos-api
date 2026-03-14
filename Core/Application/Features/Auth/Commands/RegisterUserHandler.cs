using Application.Features.Auth.Commands;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

public class RegisterStoreOwnerHandler : IRequestHandler<RegisterStoreOwnerCommand, bool>
{
    private readonly UserManager<User> _userManager;
    private readonly IStoreRepository _storeRepository;
    private readonly IPosDbContext _context;

    public RegisterStoreOwnerHandler(
        UserManager<User> userManager,
        IStoreRepository storeRepository,
        IPosDbContext context)
    {
        _userManager = userManager;
        _storeRepository = storeRepository;
        _context = context;
    }

    public async Task<bool> Handle(RegisterStoreOwnerCommand request, CancellationToken ct)
    {
        await _context.BeginTransactionAsync(ct);

        try
        {
            var store = new Store
            {
                Id = Guid.NewGuid(),
                Location = request.Location,
                StoreName = request.BusinessName,
                CreatedAt = DateTime.UtcNow
            };

            await _storeRepository.AddAsync(store, ct);
            await _context.SaveChangesAsync(ct);


            var user = new User
            {
                Email = request.Email,
                UserName = request.Email,
                FullName = request.FullName,
                StoreId = store.Id,
                Role = "StoreOwner",
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                await _context.RollbackTransactionAsync(ct);
                return false;
            }

            await _context.CommitTransactionAsync(ct);
            return true;
        }
        catch (Exception)
        {
            await _context.RollbackTransactionAsync(ct);
            throw;
        }
    }
}
