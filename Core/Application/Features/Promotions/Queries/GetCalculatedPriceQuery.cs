using MediatR;

namespace Application.Features.Promotions.Queries;

public record GetCalculatedPriceQuery(Guid ProductId, int Quantity) : IRequest<decimal>;