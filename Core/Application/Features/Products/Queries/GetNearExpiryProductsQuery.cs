using Application.Dto;
using MediatR;

namespace Application.Features.Products.Queries
{
public record GetNearExpiryProductsQuery(Guid StoreId) : IRequest<List<NearExpiryProductDto>>;
}
