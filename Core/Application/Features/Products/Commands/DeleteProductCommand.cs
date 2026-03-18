using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Products.Commands
{
    public record DeleteProductCommand(Guid Id) : IRequest<bool>
    {
    }
}
