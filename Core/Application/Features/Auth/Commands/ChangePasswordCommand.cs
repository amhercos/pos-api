using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Auth.Commands
{
    public record ChangePasswordCommand(
        Guid UserId, 
        string CurrentPassword, 
        string NewPassword) : IRequest<IdentityResult>;
}
