using Application.Dto;
using Application.Features.Auth.Queries;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

public class GetCurrentUserHandler(
    IUserRepository userRepository,
    UserManager<User> userManager)
    : IRequestHandler<GetCurrentUserQuery, CurrentUserResponse?>
{
    public async Task<CurrentUserResponse?> Handle(GetCurrentUserQuery request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {request.UserId} was not found.");
        }

 
        var roles = await userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Guest";

        return new CurrentUserResponse(
            user.UserName ?? string.Empty,
            user.FullName ?? "Unknown User",
            primaryRole,
            user.StoreId
        );
    }
}