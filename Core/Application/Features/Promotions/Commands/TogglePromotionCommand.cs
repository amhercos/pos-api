using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Promotions.Commands
{
    public record TogglePromotionCommand(Guid Id) : IRequest<bool>;
}
