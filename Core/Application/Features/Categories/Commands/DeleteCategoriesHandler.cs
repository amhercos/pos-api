using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Categories.Commands
{
    public class DeleteCategoriesHandler(
        ICategoryRepository categoryRepository,
        IPosDbContext context) : IRequestHandler<DeleteCategoryCommand, bool>
    {
        public async Task<bool> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await categoryRepository.GetByIdAsync(request.Id, cancellationToken);
            if (category == null)
            {
                return false;
            }
            categoryRepository.Remove(category);
            await context.SaveChangesAsync(cancellationToken);
            return true;

        }
    }
}
