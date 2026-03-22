using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Transactions.Queries
{
    public class GetRecentTransactionsHandler(
        ITransactionRepository transactionRepository,
        ICurrentUserService currentUserService) : IRequestHandler<GetRecentTransactionsQuery, List<RecentTransactionDto>>
    {
        public async Task<List<RecentTransactionDto>> Handle(GetRecentTransactionsQuery request, CancellationToken ct)
        {
    
            var result = await transactionRepository.GetRecentTransactionsAsync(
                request.StoreId,
                request.Page,
                request.PageSize,
                ct);

            var dtos = new List<RecentTransactionDto>();

            foreach (var t in result.Items)
            {
                var dto = new RecentTransactionDto(
                    t.Id,
                    t.TransactionDate,
                    t.TotalAmount,
                    t.PaymentType.ToString(),
                    t.Items?.Count ?? 0
                );

                dtos.Add(dto);
            }

            return dtos;
        }
    }
}