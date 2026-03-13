using Application.Dto;
using Application.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;


namespace Application.Features.Auth.Commands
{
    public class LoginUserHandler : IRequestHandler<LoginUserCommand, AuthResponseDTO>
    {
        private readonly UserManager<User> _userManager;
        private readonly IJwtService _tokenService;

        public LoginUserHandler(UserManager<User> userManager, IJwtService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDTO> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByNameAsync(request.Username);

            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                throw new UnauthorizedAccessException("Invalid username or password.");
            }

            var token = _tokenService.GenerateToken(user);

            return new AuthResponseDTO(token, user.FullName, user.UserName!);
        }
    }
}
