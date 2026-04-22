using Application.Dto;
using Domain.Entities.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Transactions.Queries
{
    public record GetRecentTransactionsQuery(
    Guid StoreId,
    int Page,
    int PageSize,
    ReportPeriod Period = ReportPeriod.Today
        ) : IRequest<List<RecentTransactionDto>>;
}
