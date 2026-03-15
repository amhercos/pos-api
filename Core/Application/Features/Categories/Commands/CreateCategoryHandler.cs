using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Categories.Commands
{
    public class CreateCategoryHandler(
    ICategoryRepository categoryRepository,
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<CreateCategoryCommand, Guid>
    {
        public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken ct)
        {
            var category = new Category
            {
                Id = Guid.NewGuid(),
                CategoryName = request.CategoryName,
                StoreId = currentUserService.StoreId,
                CreatedAt = DateTime.UtcNow
            };

            categoryRepository.Add(category);
            await context.SaveChangesAsync(ct);

            return category.Id;
        }
    }
}
