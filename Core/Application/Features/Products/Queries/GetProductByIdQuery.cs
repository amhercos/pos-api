using Application.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Products.Queries
{
    public record GetProductByIdQuery(Guid id) : IRequest<ProductDto>
    {
    
    }
}
