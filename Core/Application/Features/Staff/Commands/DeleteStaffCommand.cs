using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Staff.Commands
{
   public record DeleteStaffCommand(Guid Id) : IRequest<bool>;
}
