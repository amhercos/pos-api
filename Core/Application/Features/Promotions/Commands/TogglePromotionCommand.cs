using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Promotions.Commands
{
    public record TogglePromotionCommand(Guid MainProductId) : IRequest<bool>;
}
