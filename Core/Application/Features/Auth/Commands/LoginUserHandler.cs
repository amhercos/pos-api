using Application.Dto;
using Application.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;


namespace Application.Features.Auth.Commands
{
    public class LoginUserHandler (
        UserManager<User> userManager,
        IJwtService tokenService) : IRequestHandler<LoginUserCommand, AuthResponseDto>
    {

        public async Task<AuthResponseDto> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByNameAsync(request.Username);

            if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
            {
                throw new UnauthorizedAccessException("Invalid username or password.");
            }

            var token = tokenService.GenerateToken(user);

            return new AuthResponseDto(
                Token: token,
                FullName: user.FullName,
                Username: user.UserName!,
                Role: user.Role);
        }
    }
}
