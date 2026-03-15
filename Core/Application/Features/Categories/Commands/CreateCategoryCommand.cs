using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Categories.Commands
{
    public record CreateCategoryCommand(
        string CategoryName) : IRequest<Guid>;
}
