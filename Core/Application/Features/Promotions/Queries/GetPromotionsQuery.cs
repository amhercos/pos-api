using MediatR;
using Domain.Entities;

namespace Application.Features.Promotions.Queries;

public record GetPromotionsQuery : IRequest<IEnumerable<PromotionResponse>>;