using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.CustomerCredits.Queries
{
    public class SearchCustomerCreditHandler(
     ICustomerCreditRepository creditRepository,
     ICurrentUserService currentUserService) : IRequestHandler<SearchCustomerCreditQuery, List<CustomerCreditDto>>
    {
        public async Task<List<CustomerCreditDto>> Handle(SearchCustomerCreditQuery request, CancellationToken ct)
        {
            var storeId = currentUserService.StoreId;

            if (string.IsNullOrWhiteSpace(request.Term))
                return new List<CustomerCreditDto>();

            // Repository handles the filtering logic
            var results = await creditRepository.SearchByNameAsync(storeId, request.Term, ct);

            return results.Select(c => new CustomerCreditDto(
                c.Id,
                c.CustomerName,
                c.ContactInfo,
                c.CreditAmount
            )).ToList();
        }
    }
}
