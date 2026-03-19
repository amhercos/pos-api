using MediatR;

namespace Application.Features.CustomerCredits.Commands;

public record RecordCreditPaymentCommand(
    Guid CustomerCreditId,
    decimal AmountPaid
) : IRequest<Unit>;