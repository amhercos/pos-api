using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Categories.Commands
{
    public record DeleteCategoryCommand(Guid Id) : IRequest<bool>;
}
