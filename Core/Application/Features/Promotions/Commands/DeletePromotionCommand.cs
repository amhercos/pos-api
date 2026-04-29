using MediatR;

namespace Application.Features.Promotions.Commands;

public record DeletePromotionCommand(Guid MainProductId) : IRequest<Unit>;