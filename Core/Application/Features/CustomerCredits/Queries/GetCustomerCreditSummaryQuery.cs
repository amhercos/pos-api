using Application.Dto;
using MediatR;
using System;

namespace Application.Features.CustomerCredits.Queries;

public record GetCustomerCreditSummaryQuery(Guid CustomerId) : IRequest<CustomerCreditSummaryDto>;