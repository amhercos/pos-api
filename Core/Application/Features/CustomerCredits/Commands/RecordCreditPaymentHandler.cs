using Application.Features.CustomerCredits.Commands;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;

namespace Application.Features.CustomerCredits.Handlers;

public class RecordCreditPaymentHandler(
    ICustomerCreditRepository creditRepository,
    IPosDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<RecordCreditPaymentCommand, Unit>
{
    public async Task<Unit> Handle(RecordCreditPaymentCommand request, CancellationToken ct)
    {
        var storeId = currentUserService.StoreId;

        var account = await creditRepository.GetByIdAsync(request.CustomerCreditId, ct);
        if (account == null) throw new Exception("Customer credit record not found.");

        account.CreditAmount -= request.AmountPaid;

        // payment record creation 
        var payment = new CreditPayment
        {
            Id = Guid.NewGuid(),
            CustomerCreditId = account.Id,
            AmountPaid = request.AmountPaid,
            PaymentDate = DateTime.UtcNow,
            StoreId = storeId
        };

        creditRepository.AddPayment(payment);
        creditRepository.Update(account);

        await context.SaveChangesAsync(ct);

        return Unit.Value;
    }
}