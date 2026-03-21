using Application.Dto;
using Application.Features.Auth.Queries;
using Application.Interfaces.Repositories;
using MediatR;

public class GetCurrentUserHandler(IUserRepository userRepository)
    : IRequestHandler<GetCurrentUserQuery, CurrentUserResponse?>
{
    public async Task<CurrentUserResponse?> Handle(GetCurrentUserQuery request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, ct);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {request.UserId} was not found.");
        }

        return new CurrentUserResponse(
            user.UserName ?? string.Empty,
            user.FullName ?? "Unknown User",
            user.Role ?? "Guest",
            user.StoreId
        );
    }
}