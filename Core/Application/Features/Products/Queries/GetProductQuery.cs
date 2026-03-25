using Application.Dto;
using MediatR;

namespace Application.Features.Products.Queries
{
    // Ensure the IRequest matches the return type of the Handler
    public record GetProductQuery(int Page = 1, int PageSize = 20) : IRequest<PagedResponse<ProductDto>>;

    public record PagedResponse<T>(IEnumerable<T> Items, int TotalCount);
}