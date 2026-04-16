using Application.Dto;
using MediatR;

namespace Application.Features.Dashboard.Queries;

public record GetTopSellingProductsQuery(int Count = 5) : IRequest<IEnumerable<TopProductResponse>>;