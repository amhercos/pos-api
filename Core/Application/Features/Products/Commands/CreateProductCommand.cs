using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Products.Commands
{
    public record CreateProductCommand(
    string Name,
    string? Description,
    decimal Price,
    int StockQuantity,
    Guid CategoryId) : IRequest<Guid>;
}
