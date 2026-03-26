using MediatR;

namespace Application.Features.Profile.Command
{
    public record UpdateProfileCommand(Guid UserId, string FullName, string UserName) : IRequest<bool>;
}
