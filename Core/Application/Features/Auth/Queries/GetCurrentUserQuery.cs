using Application.Dto;
using MediatR;

namespace Application.Features.Auth.Queries
{
    public record GetCurrentUserQuery(Guid UserId) : IRequest<CurrentUserResponse?>;
}