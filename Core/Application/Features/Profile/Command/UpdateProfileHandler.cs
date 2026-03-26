using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Profile.Command
{
    public class UpdateProfileHandler(UserManager<User> userManager) : IRequestHandler<UpdateProfileCommand, bool>
    {
        public async Task<bool> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null) return false;

            user.FullName = request.FullName;
            user.UserName = request.UserName;

            var result = await userManager.UpdateAsync(user);
            return result.Succeeded;
        }
    }
}
