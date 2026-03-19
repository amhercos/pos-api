using Application.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Transactions.Queries
{
    public record GetRecentTransactionsQuery(int Count = 10) : IRequest<List<RecentTransactionDto>>;
}
