using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.CustomerCredits.Commands
{
    public class UpdateCustomerCreditHandler(
    ICustomerCreditRepository creditRepository,
    IPosDbContext context) : IRequestHandler<UpdateCustomerCreditCommand, Unit>
    {
        public async Task<Unit> Handle(UpdateCustomerCreditCommand request, CancellationToken ct)
        {
            var account = await creditRepository.GetByIdAsync(request.Id, ct);

            if (account == null)
                throw new Exception("Customer not found.");

            account.CustomerName = request.CustomerName;
            account.ContactInfo = request.ContactInfo;

            creditRepository.Update(account);
            await context.SaveChangesAsync(ct);

            return Unit.Value;
        }
    }
}
