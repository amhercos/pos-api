using Application.Dto;
using MediatR;

namespace Application.Features.CustomerCredits.Queries
{
    public record GetPaymentHistoryQuery(Guid CustomerCreditId) : IRequest<List<PaymentHistoryDto>>;

}
