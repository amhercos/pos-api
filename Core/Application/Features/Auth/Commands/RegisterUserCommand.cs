using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Auth.Commands
{
    public record RegisterUserCommand(
    string Email,
    string Username,
    string Password,
    string FullName) : IRequest<bool>;
}
