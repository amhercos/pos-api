using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Transactions.Queries
{
    public class GetRecentTransactionsHandler(
     ITransactionRepository transactionRepository,
     ICurrentUserService currentUserService) : IRequestHandler<GetRecentTransactionsQuery, List<RecentTransactionDto>>
    {
        public async Task<List<RecentTransactionDto>> Handle(GetRecentTransactionsQuery request, CancellationToken ct)
        {
            var transactions = await transactionRepository.GetRecentTransactionsAsync(
                currentUserService.StoreId,
                request.Count,
                ct);

            return transactions.Select(t => new RecentTransactionDto(
                t.Id,
                t.TransactionDate,
                t.TotalAmount,
                t.PaymentType.ToString(),
                t.Items.Count
            )).ToList();
        }
    }
}
