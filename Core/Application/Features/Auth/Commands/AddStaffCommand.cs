using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Auth.Commands
{
    public record AddStaffCommand(
    string Email,
    string Password,
    string FullName) : IRequest<bool>;
}
