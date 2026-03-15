using Application.Dto;
using MediatR;

namespace Application.Features.Categories.Queries
{
    public record GetCategoriesQuery() : IRequest<IEnumerable<CategoryDto>>;
}
