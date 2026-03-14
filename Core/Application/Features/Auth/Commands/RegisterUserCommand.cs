using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Auth.Commands
{
    public record RegisterStoreOwnerCommand(
    string Email,
    string Password,
    string FullName,
    string BusinessName,
    string Location) : IRequest<bool>;
}
