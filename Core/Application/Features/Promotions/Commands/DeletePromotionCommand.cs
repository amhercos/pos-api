using MediatR;

namespace Application.Features.Promotions.Commands;

public record DeletePromotionCommand(Guid Id) : IRequest<Unit>;