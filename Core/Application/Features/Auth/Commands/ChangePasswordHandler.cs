using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Features.Auth.Commands
{
    public class ChangePasswordHandler(UserManager<User> userManager) : IRequestHandler<ChangePasswordCommand, IdentityResult>
    {
        public async Task<IdentityResult> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null) return IdentityResult.Failed(new IdentityError { Description = "User not found." });

            return await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        }
    }
}
