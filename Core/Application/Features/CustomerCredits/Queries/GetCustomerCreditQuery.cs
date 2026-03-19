using Application.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.CustomerCredits.Queries
{
    public record GetCustomerCreditsQuery() : IRequest<List<CustomerCreditDto>>;
}
