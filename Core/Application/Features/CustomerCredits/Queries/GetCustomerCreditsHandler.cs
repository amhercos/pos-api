using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.CustomerCredits.Queries
{
    public class GetCustomerCreditsHandler(
        ICustomerCreditRepository creditRepository, 
        ICurrentUserService currentUserService)
    : IRequestHandler<GetCustomerCreditsQuery, List<CustomerCreditDto>>
    {
        public async Task<List<CustomerCreditDto>> Handle(GetCustomerCreditsQuery request, CancellationToken ct)
        {
            var storeId = currentUserService.StoreId;
            var credits = await creditRepository.GetActiveCreditsAsync(storeId, ct);

            return credits.Select(c => new CustomerCreditDto(
                c.Id,
                c.CustomerName,
                c.ContactInfo,
                c.CreditAmount
            )).ToList();
        }
    }
}

