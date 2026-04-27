using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
namespace Application.Features.Categories.Commands
{
    public class UpdateCategoryNameHandler(
        ICategoryRepository categoryRepository,
        IPosDbContext context)
        : IRequestHandler<UpdateCategoryNameCommand, bool>
    {
        public async Task<bool> Handle(UpdateCategoryNameCommand request, CancellationToken cancellationToken)
        {
            var category = await categoryRepository.GetByIdAsync(request.Id, cancellationToken);

            if (category == null)
            {
                throw new KeyNotFoundException($"Category with ID {request.Id} was not found.");
            }

            category.CategoryName = request.NewCategoryName;
            categoryRepository.Update(category);

            await context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}