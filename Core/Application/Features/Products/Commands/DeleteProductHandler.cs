using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Products.Commands
{
    public class DeleteProductHandler(IProductRepository productRepository,
        IPosDbContext context) : IRequestHandler<DeleteProductCommand, bool>
    {
        public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            var product = await productRepository.GetByIdAsync(request.Id, cancellationToken);
            if (product != null)
            {
                productRepository.Remove(product);
                await context.SaveChangesAsync(cancellationToken);
                return true;
            }
            
            return false;
        }
    }
}
