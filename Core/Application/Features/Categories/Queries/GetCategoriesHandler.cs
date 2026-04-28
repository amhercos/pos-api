using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Categories.Queries
{
    public class GetCategoriesHandler(
        IPosDbContext context,
        ICategoryRepository categoryRepository)
    : IRequestHandler<GetCategoriesQuery, IEnumerable<CategoryDto>>
    {
        public async Task<IEnumerable<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken ct)
        {
            var categories = await categoryRepository.GetAllAsync(ct);

            return categories.Select(c => new CategoryDto(
            c.Id,
            c.CategoryName,
            c.Products?.Count() ?? 0));
        }
    }
}
