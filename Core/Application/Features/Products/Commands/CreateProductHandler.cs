using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;

namespace Application.Features.Products.Commands;

public class CreateProductHandler(
    IProductRepository productRepository,
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<CreateProductCommand, Guid>
{
    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken ct)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.StockQuantity,
            CategoryId = request.CategoryId,
            StoreId = currentUserService.StoreId,
            CreatedAt = DateTime.UtcNow
        };

        productRepository.Add(product);
        await context.SaveChangesAsync(ct);

        return product.Id;
    }
}