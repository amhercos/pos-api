using Application.Dto;
using MediatR;

namespace Application.Features.Promotions.Queries;

public record GetPromotionsQuery : IRequest<IEnumerable<PromotionResponse>>;