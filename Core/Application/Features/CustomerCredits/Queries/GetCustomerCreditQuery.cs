using Application.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.CustomerCredits.Queries
{
    public record GetCustomerCreditsQuery(bool IncludeSettled = false) : IRequest<List<CustomerCreditDto>>;
}
