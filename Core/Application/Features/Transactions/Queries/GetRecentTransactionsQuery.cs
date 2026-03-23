using Application.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Transactions.Queries
{
    public record GetRecentTransactionsQuery(
    Guid StoreId,
    int Page,
    int PageSize) : IRequest<List<RecentTransactionDto>>;
}
