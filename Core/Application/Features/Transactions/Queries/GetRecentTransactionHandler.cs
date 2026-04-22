using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Transactions.Queries
{
    public class GetRecentTransactionsHandler(
        ITransactionRepository transactionRepository) : IRequestHandler<GetRecentTransactionsQuery, List<RecentTransactionDto>>
    {
        public async Task<List<RecentTransactionDto>> Handle(GetRecentTransactionsQuery request, CancellationToken ct)
        {
            DateTime? startUtc = request.Period switch
            {
                ReportPeriod.Weekly => DateTime.UtcNow.AddDays(-7),
                ReportPeriod.Monthly => DateTime.UtcNow.AddMonths(-1),
                ReportPeriod.Today => transactionRepository.GetPhStartOfTodayUtc(),
                _ => null
            };

            var result = await transactionRepository.GetRecentTransactionsAsync(
                request.StoreId,
                request.Page,
                request.PageSize,
                startUtc,
                ct);

            return result.Items.Select(t => new RecentTransactionDto(
                t.Id,
                t.TransactionDate,
                t.TotalAmount,
                t.PaymentType.ToString(),
                t.Items?.Count ?? 0
            )).ToList();
        }
    }
}