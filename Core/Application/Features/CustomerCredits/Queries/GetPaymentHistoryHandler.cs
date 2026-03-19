using Application.Dto;
using Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.CustomerCredits.Queries
{

    public class GetPaymentHistoryHandler(
        ICustomerCreditRepository creditRepository) : IRequestHandler<GetPaymentHistoryQuery, List<PaymentHistoryDto>>
    {
        public async Task<List<PaymentHistoryDto>> Handle(GetPaymentHistoryQuery request, CancellationToken ct)
        {
            var payments = await creditRepository.GetPaymentHistoryAsync(request.CustomerCreditId, ct);

            return payments.Select(p => new PaymentHistoryDto(
                p.Id,
                p.AmountPaid,
                p.PaymentDate
                )).ToList();
        }
    }
}
